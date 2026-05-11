const { sendEmail, getOrderConfirmationTemplate } = require('./sendEmail');
const { generateOrderReceipt } = require('./pdfGenerator');
const Order = require('../models/Order');

/**
 * Triggers the order confirmation email with PDF receipt attachment
 * Added a 30-second delay as requested by the user.
 */
const triggerOrderConfirmationEmail = async (orderId) => {
  // Use setTimeout to delay the email by 30 seconds
  setTimeout(async () => {
    try {
      const order = await Order.findById(orderId).populate('user', 'name email');
      if (!order || !order.user?.email) return;

      console.log(`Starting email generation for order #${order.orderId} after 30s delay...`);

      // 1. Generate PDF Receipt
      const pdfBuffer = await generateOrderReceipt(order);

      // 2. Prepare Email Content
      const emailHtml = getOrderConfirmationTemplate(order);

      // 3. Send Email
      await sendEmail({
        email: order.user.email,
        subject: `Order Confirmed - #${order.orderId}`,
        html: emailHtml,
        attachments: [
          {
            filename: `Receipt-${order.orderId}.pdf`,
            content: pdfBuffer,
            contentType: 'application/pdf',
          },
        ],
      });

      console.log(`Email sent to ${order.user.email} for order #${order.orderId}`);
    } catch (error) {
      console.error('Failed to trigger order confirmation email:', error);
    }
  }, 30000); // 30 seconds delay
};

module.exports = { triggerOrderConfirmationEmail };
