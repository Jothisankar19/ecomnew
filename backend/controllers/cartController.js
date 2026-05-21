const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');

// Helper to recalculate applied cart coupon discount
const recalculateCartCoupon = async (cart) => {
  if (!cart.coupon || !cart.coupon.code) return;
  
  try {
    const coupon = await Coupon.findOne({ code: cart.coupon.code.toUpperCase() });
    if (!coupon) {
      cart.coupon = undefined;
      return;
    }
    
    // Calculate subtotal of active items in cart
    let subtotal = 0;
    cart.items.forEach(item => {
      if (item.product && !item.savedForLater) {
        const price = item.product.discountPrice || item.product.price || 0;
        subtotal += price * item.quantity;
      }
    });
    
    // Validate coupon
    const validity = coupon.isValid(subtotal, cart.user);
    if (!validity.valid) {
      cart.coupon = undefined;
      return;
    }
    
    // Recalculate discount
    const discount = coupon.calculateDiscount(cart.items, subtotal);
    cart.coupon.discount = discount;
  } catch (error) {
    console.error('Error recalculating cart coupon:', error);
  }
};

// @desc    Get cart
// @route   GET /api/cart
exports.getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id })
      .populate('items.product', 'name images price discountPrice stock slug colors sizes category isActive')

    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] })
    }

    // Filter out items where product was deleted or deactivated
    let changed = false
    const validItems = cart.items.filter(item => {
      if (!item.product || item.product.isActive === false) {
        changed = true
        return false
      }
      // Ensure quantity doesn't exceed stock
      if (item.quantity > item.product.stock && item.product.stock >= 0) {
        item.quantity = item.product.stock
        changed = true
      }
      return true
    })

    if (changed) {
      cart.items = validItems
    }

    // Auto-recalculate coupon if present
    if (cart.coupon && cart.coupon.code) {
      const oldDiscount = cart.coupon.discount;
      await recalculateCartCoupon(cart);
      if (!cart.coupon || oldDiscount !== cart.coupon.discount) {
        changed = true;
      }
    }

    if (changed) {
      await cart.save()
    }

    res.json({ success: true, cart })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// @desc    Add to cart
// @route   POST /api/cart/add
exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1, size, color, customization } = req.body;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    if (product.stock < quantity) {
      return res.status(400).json({ success: false, message: 'Insufficient stock' });
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) cart = await Cart.create({ user: req.user._id, items: [] });

    const existingIndex = cart.items.findIndex(
      item => item.product.toString() === productId && item.size === size && item.color === color && !item.savedForLater
    );

    if (existingIndex > -1) {
      cart.items[existingIndex].quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity, size, color, customization });
    }

    // Populate category so that recalculateCartCoupon can read it
    await cart.populate('items.product', 'name images price discountPrice stock slug category');
    await recalculateCartCoupon(cart);
    await cart.save();
    
    res.json({ success: true, message: 'Added to cart', cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update cart item
// @route   PUT /api/cart/update/:itemId
exports.updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body
    const cart = await Cart.findOne({ user: req.user._id })
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' })

    const item = cart.items.id(req.params.itemId)
    if (!item) return res.status(404).json({ success: false, message: 'Item not found in cart' })

    if (quantity <= 0) {
      cart.items.pull(req.params.itemId)
    } else {
      // Check stock limit
      const product = await Product.findById(item.product)
      if (product && quantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Only ${product.stock} items available in stock`
        })
      }
      item.quantity = quantity
    }

    // Populate category so that recalculateCartCoupon can read it
    await cart.populate('items.product', 'name images price discountPrice stock slug category');
    await recalculateCartCoupon(cart);
    await cart.save()
    
    res.json({ success: true, message: 'Cart updated', cart })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// @desc    Remove from cart
// @route   DELETE /api/cart/remove/:itemId
exports.removeFromCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });
    cart.items.pull(req.params.itemId);
    
    // Populate category so that recalculateCartCoupon can read it
    await cart.populate('items.product', 'name images price discountPrice stock slug category');
    await recalculateCartCoupon(cart);
    await cart.save();
    
    res.json({ success: true, message: 'Item removed from cart', cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Save for later
// @route   PUT /api/cart/save-later/:itemId
exports.saveForLater = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });
    const item = cart.items.id(req.params.itemId);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    item.savedForLater = !item.savedForLater;
    
    // Populate category so that recalculateCartCoupon can read it
    await cart.populate('items.product', 'name images price discountPrice stock slug category');
    await recalculateCartCoupon(cart);
    await cart.save();
    
    res.json({ success: true, message: item.savedForLater ? 'Saved for later' : 'Moved to cart', cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Apply coupon
// @route   POST /api/cart/apply-coupon
exports.applyCoupon = async (req, res) => {
  try {
    const { code, orderAmount } = req.body;
    const coupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (!coupon) return res.status(404).json({ success: false, message: 'Invalid coupon code' });

    const validity = coupon.isValid(orderAmount, req.user._id);
    if (!validity.valid) return res.status(400).json({ success: false, message: validity.message });

    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });

    const discount = coupon.calculateDiscount(cart.items, orderAmount);
    if (discount === 0) {
      return res.status(400).json({
        success: false,
        message: 'This coupon is not applicable for this product category'
      });
    }

    cart.coupon = { code: coupon.code, discount, discountType: coupon.discountType };
    await cart.save();

    res.json({
      success: true,
      message: 'Coupon applied successfully',
      discount,
      coupon: { code: coupon.code, description: coupon.description }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Remove coupon
// @route   DELETE /api/cart/remove-coupon
exports.removeCoupon = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (cart) { cart.coupon = undefined; await cart.save(); }
    res.json({ success: true, message: 'Coupon removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Clear cart
// @route   DELETE /api/cart/clear
exports.clearCart = async (req, res) => {
  try {
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [], coupon: undefined });
    res.json({ success: true, message: 'Cart cleared' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
