const PDFDocument = require('pdfkit');

/**
 * Generates a professional order receipt PDF
 * @param {Object} order - The order object from DB
 * @returns {Promise<Buffer>} - PDF Buffer
 */
const generateOrderReceipt = (order) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', (err) => reject(err));

    // Header
    doc
      .fillColor('#444444')
      .fontSize(20)
      .text('KURTI ELEGANCE', 50, 50)
      .fontSize(10)
      .text('123 Fashion Street, Jaipur, Rajasthan', 200, 50, { align: 'right' })
      .text('Jaipur, Rajasthan, 302001', 200, 65, { align: 'right' })
      .text('Phone: +91 98765 43210', 200, 80, { align: 'right' })
      .moveDown();

    // Horizontal Line
    doc.strokeColor('#aaaaaa').lineWidth(1).moveTo(50, 100).lineTo(550, 100).stroke();

    // Order Info
    doc
      .fontSize(12)
      .fillColor('#000000')
      .text(`Invoice Number: INV-${order.orderId}`, 50, 120)
      .text(`Order Date: ${new Date(order.createdAt).toLocaleDateString('en-IN')}`, 50, 135)
      .text(`Payment Status: ${order.payment.status.toUpperCase()}`, 50, 150)
      .text(`Payment Method: ${order.payment.method.toUpperCase()}`, 50, 165)
      
      .text('Bill To:', 300, 120, { font: 'Helvetica-Bold' })
      .fontSize(10)
      .text(order.shippingAddress.name, 300, 135)
      .text(order.shippingAddress.addressLine1, 300, 150)
      .text(`${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pincode}`, 300, 165)
      .text(`Phone: ${order.shippingAddress.phone}`, 300, 180)
      .moveDown();

    // Table Header
    const tableTop = 220;
    doc
      .fontSize(10)
      .fillColor('#666666')
      .text('Item Description', 50, tableTop)
      .text('Qty', 300, tableTop)
      .text('Unit Price', 350, tableTop, { width: 90, align: 'right' })
      .text('Total', 450, tableTop, { width: 100, align: 'right' });

    doc.strokeColor('#eeeeee').lineWidth(1).moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

    // Table Items
    let currentY = tableTop + 30;
    order.items.forEach((item) => {
      doc
        .fontSize(10)
        .fillColor('#333333')
        .text(item.name, 50, currentY, { width: 240 })
        .text(item.quantity.toString(), 300, currentY)
        .text(`Rs. ${item.price.toLocaleString('en-IN')}`, 350, currentY, { width: 90, align: 'right' })
        .text(`Rs. ${(item.price * item.quantity).toLocaleString('en-IN')}`, 450, currentY, { width: 100, align: 'right' });

      currentY += 25;
    });

    // Summary Line
    doc.strokeColor('#eeeeee').lineWidth(1).moveTo(50, currentY + 5).lineTo(550, currentY + 5).stroke();

    // Calculations
    const summaryY = currentY + 20;
    doc
      .fontSize(10)
      .fillColor('#666666')
      .text('Subtotal:', 350, summaryY, { width: 90, align: 'right' })
      .text(`Rs. ${order.pricing.subtotal.toLocaleString('en-IN')}`, 450, summaryY, { width: 100, align: 'right' })
      
      .text('GST (5%):', 350, summaryY + 15, { width: 90, align: 'right' })
      .text(`Rs. ${order.pricing.tax.toLocaleString('en-IN')}`, 450, summaryY + 15, { width: 100, align: 'right' })
      
      .text('Shipping:', 350, summaryY + 30, { width: 90, align: 'right' })
      .text(order.pricing.shipping === 0 ? 'FREE' : `Rs. ${order.pricing.shipping.toLocaleString('en-IN')}`, 450, summaryY + 30, { width: 100, align: 'right' });

    if (order.pricing.couponDiscount > 0) {
      doc
        .fillColor('#e63946')
        .text('Discount:', 350, summaryY + 45, { width: 90, align: 'right' })
        .text(`-Rs. ${order.pricing.couponDiscount.toLocaleString('en-IN')}`, 450, summaryY + 45, { width: 100, align: 'right' });
    }

    const totalY = summaryY + 70;
    doc
      .fontSize(14)
      .fillColor('#d4af37')
      .text('Grand Total:', 350, totalY, { width: 90, align: 'right' })
      .text(`Rs. ${order.pricing.total.toLocaleString('en-IN')}`, 450, totalY, { width: 100, align: 'right' });

    // Footer
    doc
      .fontSize(8)
      .fillColor('#aaaaaa')
      .text('Thank you for shopping with Kurti Elegance! This is a computer generated receipt.', 50, 700, { align: 'center', width: 500 });

    doc.end();
  });
};

module.exports = { generateOrderReceipt };
