const nodemailer = require('nodemailer');

/**
 * Sends a professional HTML email with optional attachments
 */
const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT) || 587,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"Kurti Elegance" <${process.env.EMAIL_USER}>`,
    to: options.to || options.email,
    subject: options.subject,
    html: options.html,
    attachments: options.attachments || [],
  };

  await transporter.sendMail(mailOptions);
};

/**
 * Generates a neat HTML email template for order confirmation
 */
const getOrderConfirmationTemplate = (order) => {
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #f0f0f0; padding: 40px; color: #333;">
      <div style="text-align: center; margin-bottom: 40px;">
        <h1 style="color: #d4af37; margin: 0;">KURTI ELEGANCE</h1>
        <p style="color: #999; text-transform: uppercase; letter-spacing: 2px; font-size: 12px;">Order Confirmed</p>
      </div>
      
      <p>Hello ${order.shippingAddress.name.split(' ')[0]},</p>
      <p>Great news! Your order <strong>#${order.orderId}</strong> has been confirmed and is being prepared for shipment.</p>
      
      <div style="background: #fdf8f3; border-radius: 20px; padding: 30px; margin: 30px 0;">
        <h3 style="margin-top: 0;">Order Summary</h3>
        ${order.items.map(item => `
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
            <span>${item.name} x ${item.quantity}</span>
            <span>Rs. ${(item.price * item.quantity).toLocaleString('en-IN')}</span>
          </div>
        `).join('')}
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <div style="display: flex; justify-content: space-between; font-weight: bold; color: #d4af37; font-size: 18px;">
          <span>Total Amount</span>
          <span>Rs. ${order.pricing.total.toLocaleString('en-IN')}</span>
        </div>
      </div>

      <div style="margin-bottom: 30px;">
        <h4 style="margin-bottom: 10px;">Shipping To:</h4>
        <p style="color: #666; margin: 0;">${order.shippingAddress.addressLine1}, ${order.shippingAddress.city}</p>
        <p style="color: #666; margin: 0;">${order.shippingAddress.state} - ${order.shippingAddress.pincode}</p>
      </div>

      <p style="font-size: 14px; color: #999;">We've attached the official receipt for your records. You can also track your order in your account dashboard.</p>
      
      <div style="text-align: center; margin-top: 50px; padding-top: 30px; border-top: 1px solid #f0f0f0;">
        <p style="font-size: 12px; color: #ccc;">&copy; 2026 Kurti Elegance. All rights reserved.</p>
      </div>
    </div>
  `;
};

/**
 * Generates a neat HTML email template for welcome message
 */
const getWelcomeTemplate = (user) => {
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #f0f0f0; padding: 40px; color: #333;">
      <div style="text-align: center; margin-bottom: 40px;">
        <h1 style="color: #d4af37; margin: 0;">KURTI ELEGANCE</h1>
        <p style="color: #999; text-transform: uppercase; letter-spacing: 2px; font-size: 12px;">Welcome to the Family</p>
      </div>
      
      <p>Hello ${user.name.split(' ')[0]},</p>
      <p>Welcome to <strong>Kurti Elegance</strong>! We are thrilled to have you with us.</p>
      <p>Your account has been successfully created. You can now explore our latest collections, save your favorites to the wishlist, and enjoy a seamless shopping experience.</p>
      
      <div style="background: #fdf8f3; border-radius: 20px; padding: 30px; margin: 30px 0; text-align: center;">
        <h3 style="margin-top: 0; color: #gray-900;">Exclusive Offer for You</h3>
        <p style="color: #666;">Use code <strong style="color: #d4af37;">WELCOME10</strong> to get 10% OFF on your first order!</p>
        <a href="${process.env.CLIENT_URL}/products" style="display: inline-block; background: #d4af37; color: white; padding: 12px 25px; border-radius: 12px; text-decoration: none; font-weight: bold; margin-top: 10px;">Start Shopping</a>
      </div>

      <p style="font-size: 14px; color: #666;">If you have any questions, just reply to this email. We're here to help!</p>
      
      <div style="text-align: center; margin-top: 50px; padding-top: 30px; border-top: 1px solid #f0f0f0;">
        <p style="font-size: 12px; color: #ccc;">&copy; 2026 Kurti Elegance. All rights reserved.</p>
      </div>
    </div>
  `;
};

module.exports = { sendEmail, getOrderConfirmationTemplate, getWelcomeTemplate };
