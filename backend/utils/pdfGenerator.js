const PDFDocument = require('pdfkit');
const path = require('path');

/**
 * Converts a number to Indian currency words
 */
const numberToWords = (num) => {
  const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const convert = (n) => {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : '');
    if (n < 1000) return a[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' and ' + convert(n % 100) : '');
    if (n < 100000) return convert(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 !== 0 ? ' ' + convert(n % 1000) : '');
    if (n < 10000000) return convert(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 !== 0 ? ' ' + convert(n % 100000) : '');
    return convert(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 !== 0 ? ' ' + convert(n % 10000000) : '');
  };

  if (num === 0) return 'Zero INR Only';
  return convert(Math.floor(num)) + ' INR Only';
};

/**
 * Generates a professional order receipt PDF
 * @param {Object} order - The order object from DB
 * @returns {Promise<Buffer>} - PDF Buffer
 */
const generateOrderReceipt = (order) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const chunks = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', (err) => reject(err));

    // Logo (if exists)
    const logoPath = path.join(__dirname, '../assets/logo.png');
    try {
      doc.image(logoPath, 450, 40, { width: 100 });
    } catch (e) {
      // If logo doesn't exist, just skip
    }

    // Title
    doc
      .fillColor('#000000')
      .font('Helvetica-Bold')
      .fontSize(28)
      .text('Payment Receipt', 50, 40);

    // Business Info
    doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .text('Kurti Elegance', 50, 100)
      .font('Helvetica')
      .fontSize(10)
      .text('erode', 50, 115)
      .text('Erode, Tamilnadu', 50, 130)
      .text('India', 50, 145)
      .text('jothieswaramoorthy@gmail.com', 50, 160);

    // To Section
    doc
      .font('Helvetica-Bold')
      .fontSize(12)
      .text('To:', 50, 200)
      .font('Helvetica')
      .fontSize(10)
      .text(order.shippingAddress.name, 50, 215)
      .text(order.shippingAddress.addressLine1, 50, 230)
      .text(`${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pincode}`, 50, 245)
      .text(`Phone: ${order.shippingAddress.phone}`, 50, 260);

    // Order Meta Info
    const metaX = 350;
    doc
      .font('Helvetica-Bold')
      .text('Payment Date :', metaX, 200)
      .text('Invoice No :', metaX, 225)
      .text('Billing Ref :', metaX, 250)
      .text('Payment Method :', metaX, 275)
      
      .font('Helvetica')
      .text(new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }), 480, 200)
      .text(`INV-${order.orderId}`, 480, 225)
      .text(order.payment?.transactionId || '5203591', 480, 250)
      .text(order.payment.method.toUpperCase(), 480, 275);

    // Table Header
    const tableTop = 320;
    doc
      .rect(45, tableTop, 505, 25)
      .fill('#E5E7EB');
    
    doc
      .fillColor('#000000')
      .font('Helvetica-Bold')
      .fontSize(10)
      .text('Description', 55, tableTop + 8)
      .text('Qty', 355, tableTop + 8, { width: 40, align: 'center' })
      .text('Rate', 415, tableTop + 8, { width: 60, align: 'right' })
      .text('Amount', 495, tableTop + 8, { width: 50, align: 'right' });

    // Table Items
    let currentY = tableTop + 25;
    order.items.forEach((item, index) => {
      // Draw row borders
      doc
        .rect(45, currentY, 505, 25)
        .strokeColor('#E5E7EB')
        .lineWidth(1)
        .stroke();
      
      // Draw vertical lines
      doc.moveTo(350, currentY).lineTo(350, currentY + 25).stroke();
      doc.moveTo(410, currentY).lineTo(410, currentY + 25).stroke();
      doc.moveTo(480, currentY).lineTo(480, currentY + 25).stroke();

      doc
        .font('Helvetica')
        .fontSize(10)
        .fillColor('#000000')
        .text(item.product?.name || `Product ${index + 1}`, 55, currentY + 8, { width: 290, truncate: true })
        .text(item.quantity.toString(), 355, currentY + 8, { width: 40, align: 'center' })
        .text(`Rs. ${item.price.toLocaleString('en-IN')}`, 415, currentY + 8, { width: 60, align: 'right' })
        .text(`Rs. ${(item.price * item.quantity).toLocaleString('en-IN')}`, 495, currentY + 8, { width: 50, align: 'right' });

      currentY += 25;
    });

    // Summary
    doc
      .font('Helvetica-Bold')
      .fontSize(12)
      .text('Total :', 350, currentY + 20, { width: 130, align: 'right' })
      .text(`Rs. ${order.pricing.total.toLocaleString('en-IN')}`, 480, currentY + 20, { width: 65, align: 'right' });

    doc
      .lineWidth(1)
      .moveTo(350, currentY + 45)
      .lineTo(550, currentY + 45)
      .strokeColor('#000000')
      .stroke();

    // Amount in Words
    doc
      .font('Helvetica-Bold')
      .fontSize(10)
      .text(`Amount: ${numberToWords(order.pricing.total)}`, 45, currentY + 70);

    // PAID Stamp
    const stampY = currentY + 120;
    doc
      .save()
      .rotate(-15, { origin: [300, stampY] })
      .rect(250, stampY, 150, 60)
      .lineWidth(4)
      .strokeColor('#10B981')
      .stroke();
    
    doc
      .fillColor('#10B981')
      .fontSize(40)
      .font('Helvetica-Bold')
      .text('PAID', 265, stampY + 10)
      .restore();

    doc.end();
  });
};

module.exports = { generateOrderReceipt };
