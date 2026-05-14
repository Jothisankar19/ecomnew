const { sendEmail, getOrderConfirmationTemplate, getOrderDeliveredTemplate } = require('./sendEmail');
const { generateOrderReceipt } = require('./pdfGenerator');
const Order = require('../models/Order');

/**
 * Triggers the order confirmation email (No PDF attachment now)
 */
const triggerOrderConfirmationEmail = async (orderId) => {
  setTimeout(async () => {
    try {
      const order = await Order.findById(orderId).populate('user', 'name email');
      if (!order || !order.user?.email) return;

      const emailHtml = getOrderConfirmationTemplate(order);

      await sendEmail({
        email: order.user.email,
        subject: `Order Confirmed - #${order.orderId}`,
        html: emailHtml,
      });

      console.log(`Confirmation email sent to ${order.user.email} for order #${order.orderId}`);
    } catch (error) {
      console.error('Failed to trigger order confirmation email:', error);
    }
  }, 2000); // Small delay to ensure order is saved
};

/**
 * Triggers the order delivered email with PDF receipt attachment
 */
const triggerOrderDeliveredEmail = async (orderId) => {
  // Send 1 second after status change to delivered
  setTimeout(async () => {
    try {
      const order = await Order.findById(orderId)
        .populate('user', 'name email')
        .populate('items.product', 'name');
      
      if (!order || !order.user?.email) return;

      // 1. Generate PDF Receipt
      const pdfBuffer = await generateOrderReceipt(order);

      // 2. Prepare Email Content (You might need a delivered template)
      // If getOrderDeliveredTemplate doesn't exist, we'll need to create it or use a fallback
      const emailHtml = typeof getOrderDeliveredTemplate === 'function' 
        ? getOrderDeliveredTemplate(order) 
        : `<h1>Your order #${order.orderId} has been delivered!</h1><p>Thank you for shopping with Kurti Elegance. Please find your receipt attached.</p>`;

      // 3. Send Email
      await sendEmail({
        email: order.user.email,
        subject: `Order Delivered & Your Receipt - #${order.orderId}`,
        html: emailHtml,
        attachments: [
          {
            filename: `Receipt-${order.orderId}.pdf`,
            content: pdfBuffer,
            contentType: 'application/pdf',
          },
        ],
      });

      console.log(`Delivered email with receipt sent to ${order.user.email} for order #${order.orderId}`);
    } catch (error) {
      console.error('Failed to trigger order delivered email:', error);
    }
  }, 1000); 
};

module.exports = { triggerOrderConfirmationEmail, triggerOrderDeliveredEmail };
