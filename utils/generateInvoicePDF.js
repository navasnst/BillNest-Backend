const PDFDocument = require('pdfkit');
const Invoice = require('../models/Invoice');

const generateInvoicePDF = (invoice, res) => {

    const doc = new PDFDocument();

    // Set the response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice_${invoice.invoiceNumber}.pdf`);

    doc.pipe(res);

    doc.fontSize(20).text('INVOICE', { align: 'center' });
    doc.moveDown();

    doc.fontSize(12).text(`Business: ${invoice.business.businessName}`);
    doc.text(`Customer: ${invoice.customer.name}`);
    doc.text(`Invoice No: ${invoice.invoiceNumber}`);
    doc.text(`Date: ${invoice.createdAt.toDateString()}`);
    doc.moveDown();
    let y = doc.y + 10

    // Header Row
    if (invoice.isGSTInvoice) {
        doc.fontSize(12).text("Item", 50, y)
        doc.text("Qty", 200, y)
        doc.text("Price", 250, y)
        doc.text("GST%", 320, y)
        doc.text("Total", 380, y)
    } else {
        doc.fontSize(12).text("Item", 50, y)
        doc.text("Qty", 200, y)
        doc.text("Price", 250, y)
        doc.text("Total", 320, y)
    }

    // Line below header
    y += 15
    doc.moveTo(50, y).lineTo(550, y).stroke()

    y += 10

    // Items
    invoice.items.forEach((item) => {
        doc.text(item.name, 50, y)
        doc.text(`${item.quantity}`, 200, y)

        if (invoice.isGSTInvoice) {
            doc.text(`₹${item.price}`, 250, y)
            doc.text(`${item.gstRate}%`, 320, y)
            doc.text(`₹${item.total}`, 380, y)
        } else {
            doc.text(`₹${item.price}`, 300, y)
            doc.text(`₹${item.price * item.quantity}`, 400, y)
        }

        y += 20
    })

    doc.moveDown();

    doc.text(`Subtotal: ₹${invoice.subtotal}`);

    if (invoice.isGSTInvoice) {
        doc.text(`CGST: ₹${invoice.cgst}`);
        doc.text(`SGST: ₹${invoice.sgst}`);
        doc.text(`IGST: ₹${invoice.igst}`);
    }

    doc.text(`Grand Total: ₹${invoice.grandTotal}`);

    doc.end();

}


module.exports = generateInvoicePDF