const Order = require('../models/Order');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const Coupon = require('../models/Coupon');
const { triggerOrderConfirmationEmail, triggerOrderDeliveredEmail } = require('../utils/orderNotifications');
const { generateOrderReceipt } = require('../utils/pdfGenerator');

// @desc    Create new order
// @route   POST /api/orders
exports.createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, payment, couponCode } = req.body;

    // Validate products and calculate pricing
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ success: false, message: `Product ${item.product} not found` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ success: false, message: `Insufficient stock for ${product.name}` });
      }
      const price = product.discountPrice || product.price;
      subtotal += price * item.quantity;
      orderItems.push({
        product: product._id,
        name: product.name,
        image: product.images[0]?.url,
        price,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
        customization: item.customization
      });
    }

    // Apply coupon
    let couponDiscount = 0;
    let couponData = null;
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
      if (coupon) {
        const validity = coupon.isValid(subtotal, req.user._id);
        if (validity.valid) {
          couponDiscount = coupon.calculateDiscount(subtotal);
          couponData = { code: coupon.code, discount: couponDiscount };
        }
      }
    }

    // Calculate shipping and tax
    const shipping = subtotal > 999 ? 0 : 99;
    const tax = Math.round((subtotal - couponDiscount) * 0.05); // 5% GST
    const total = subtotal - couponDiscount + shipping + tax;

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      pricing: { subtotal, couponDiscount, shipping, tax, total },
      coupon: couponData,
      payment: { method: payment.method, status: 'pending' },
      statusHistory: [{ status: 'processing', note: 'Order placed successfully' }]
    });

    // Update product stock
    for (const item of items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity, sold: item.quantity }
      });
    }

    // Mark coupon as used
    if (couponCode && couponData) {
      await Coupon.findOneAndUpdate(
        { code: couponCode.toUpperCase() },
        { $inc: { usedCount: 1 }, $push: { usedBy: req.user._id } }
      );
    }

    // Clear cart
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });

    const populatedOrder = await Order.findById(order._id).populate('items.product', 'name images');

    // Trigger email for Cash on Delivery (immediate confirmation)
    if (payment.method === 'cod') {
      triggerOrderConfirmationEmail(order._id);
    }

    res.status(201).json({ success: true, message: 'Order placed successfully', order: populatedOrder });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user orders
// @route   GET /api/orders/my-orders
exports.getMyOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const query = { user: req.user._id };
    if (status) query.orderStatus = status;

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate('items.product', 'name images slug')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ success: true, total, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('items.product', 'name images slug');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    // Check ownership or admin
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    if (!['processing', 'confirmed'].includes(order.orderStatus)) {
      return res.status(400).json({ success: false, message: 'Order cannot be cancelled at this stage' });
    }
    order.orderStatus = 'cancelled';
    order.cancelReason = req.body.reason;
    order.statusHistory.push({ status: 'cancelled', note: req.body.reason, updatedBy: req.user._id });
    await order.save();

    // Restore stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity, sold: -item.quantity }
      });
    }
    res.json({ success: true, message: 'Order cancelled successfully', order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Request return
// @route   PUT /api/orders/:id/return
exports.requestReturn = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    if (order.orderStatus !== 'delivered') {
      return res.status(400).json({ success: false, message: 'Only delivered orders can be returned' });
    }
    order.orderStatus = 'return_requested';
    order.returnReason = req.body.reason;
    order.statusHistory.push({ status: 'return_requested', note: req.body.reason, updatedBy: req.user._id });
    await order.save();
    res.json({ success: true, message: 'Return request submitted', order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Admin - Get all orders
// @route   GET /api/orders/admin/all
exports.getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const query = {};
    if (status) query.orderStatus = status;
    if (search) query.orderId = { $regex: search, $options: 'i' };

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const stats = await Order.aggregate([
      { $group: { _id: '$orderStatus', count: { $sum: 1 }, revenue: { $sum: '$pricing.total' } } }
    ]);

    res.json({ success: true, total, orders, stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Admin - Update order status
// @route   PUT /api/orders/admin/:id/status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, note, trackingNumber, carrier } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    order.orderStatus = status;
    order.statusHistory.push({ status, note, updatedBy: req.user._id });

    if (status === 'shipped' && trackingNumber) {
      order.tracking = { trackingNumber, carrier, estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) };
    }
    if (status === 'delivered') {
      order.deliveredAt = new Date();
      order.payment.status = 'paid';
      triggerOrderDeliveredEmail(order._id);
    }
    await order.save();
    res.json({ success: true, message: 'Order status updated', order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Admin - Delete order permanently
// @route   DELETE /api/orders/admin/:id
exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    
    await Order.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Order permanently deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// @desc    Download order receipt PDF
// @route   GET /api/orders/:id/receipt
exports.downloadOrderReceipt = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('items.product', 'name');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Check ownership or admin
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const pdfBuffer = await generateOrderReceipt(order);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=Receipt-${order.orderId}.pdf`,
      'Content-Length': pdfBuffer.length,
    });

    res.send(pdfBuffer);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
