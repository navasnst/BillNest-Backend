
const Invoice = require('../models/Invoice')
const Product = require('../models/Products')
const Business = require('../models/Business')
const Customer = require('../models/Customer')
const Ledger = require("../models/Ledger")
const generateInvoicePDF = require('../utils/generateInvoicePDF')

// ✅ CREATE INVOICE
exports.createInvoice = async (req, res) => {
    try {
        const {
            businessId,
            customerId,
            items,
            paymentMode,
            paidAmount
        } = req.body

        // ✅ VALIDATIONS
        if (!businessId || !customerId) {
            return res.status(400).json({ message: "Missing required fields" })
        }

        if (!items || items.length === 0) {
            return res.status(400).json({ message: "Add at least one product" })
        }

        let subtotal = 0
        let totalGST = 0
        let invoiceItems = []

        const business = await Business.findById(businessId)
        const customer = await Customer.findOne({
            _id: customerId,
            business: businessId
        })

        if (!business || !customer) {
            return res.status(404).json({ message: "Business or Customer not found" })
        }

        const isGSTRegistered = business.gstNumber && business.gstNumber !== ""

        // ✅ ITEMS LOOP
        for (let item of items) {

            if (!item.productId || item.quantity <= 0) {
                return res.status(400).json({ message: "Invalid product data" })
            }

            const product = await Product.findOne({
                _id: item.productId,
                business: businessId
            })

            if (!product) {
                return res.status(404).json({ message: "Product not found" })
            }

            if (product.stock < item.quantity) {
                return res.status(400).json({
                    message: `Insufficient stock for ${product.name}`
                })
            }

            const itemTotal = product.price * item.quantity

            let gstAmount = 0
            if (isGSTRegistered) {
                gstAmount = (itemTotal * product.gstRate) / 100
            }

            subtotal += itemTotal
            totalGST += gstAmount

            invoiceItems.push({
                product: product._id,
                name: product.name,
                quantity: item.quantity,
                price: product.price,
                gstRate: isGSTRegistered ? product.gstRate : 0,
                gstAmount,
                total: itemTotal + gstAmount
            })

            product.stock -= item.quantity
            await product.save()
        }

        // ✅ GST SPLIT
        let cgst = 0, sgst = 0, igst = 0

        if (isGSTRegistered) {
            if (business.state?.toLowerCase() === customer.state?.toLowerCase()) {
                cgst = totalGST / 2
                sgst = totalGST / 2
            } else {
                igst = totalGST
            }
        }

        const grandTotal = subtotal + totalGST

        const paid = paidAmount || 0
        const due = grandTotal - paid

        if (paid > grandTotal) {
            return res.status(400).json({
                message: "Paid amount cannot exceed total"
            })
        }

        // ✅ PAYMENT STATUS
        let paymentStatus = "Paid"
        if (paid === 0) paymentStatus = "Unpaid"
        else if (paid < grandTotal) paymentStatus = "Partial"

        // ✅ INVOICE NUMBER
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)

        const count = await Invoice.countDocuments({
            createdAt: { $gte: today, $lt: tomorrow }
        })

        const sequence = String(count + 1).padStart(3, "0")
        const invoiceNumber = `INV-${today.toISOString().slice(0, 10)}/${sequence}`

        // ✅ CREATE INVOICE
        const invoice = await Invoice.create({
            business: businessId,
            customer: customerId,
            invoiceNumber,
            items: invoiceItems,
            subtotal,
            cgst,
            sgst,
            igst,
            grandTotal,
            paymentMode: paymentMode || "Cash",
            paidAmount: paid,
            dueAmount: due,
            paymentStatus,
            isGSTInvoice: isGSTRegistered
        })

        // ✅ LEDGER ENTRIES
        try {
            // 💰 Payment received
            if (paid > 0) {
                await Ledger.create({
                    business: businessId,
                    type: paymentMode === "Cash" ? "Cash" : "Bank",
                    amount: paid,
                    transactionType: "IN",
                    source: "invoice", 
                    referenceId: invoice._id,
                    note: "Invoice payment received"
                })
            }

            // 📒 CREDIT SALE (Receivable)
            if (due > 0) {
                await Ledger.create({
                    business: businessId,
                    type: "Bank",
                    amount: due,
                    transactionType: "IN",
                    source: "receipt", // treated as receivable
                    referenceId: invoice._id,
                    note: "Credit sale (Receivable)"
                })
            }

        } catch (err) {
            console.error("Ledger Error:", err.message)
        }

        res.status(201).json(invoice)

    } catch (error) {
        console.error("INVOICE ERROR:", error)
        res.status(500).json({ error: error.message })
    }
}


// ✅ GET INVOICES
exports.getInvoices = async (req, res) => {
    try {

        const { businessId } = req.params

        const invoices = await Invoice.find({ business: businessId })
            .populate('customer')
            .sort({ createdAt: -1 })

        res.json(invoices)

    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}


// ✅ CANCEL INVOICE
exports.cancelInvoice = async (req, res) => {
    try {

        const { id } = req.params

        const invoice = await Invoice.findById(id)

        if (!invoice) {
            return res.status(404).json({ message: "Invoice not found" })
        }

        if (invoice.status === "Cancelled") {
            return res.status(400).json({ message: "Invoice already cancelled" })
        }

        // 🔁 Restore stock
        for (let item of invoice.items) {
            const product = await Product.findById(item.product)
            if (product) {
                product.stock += item.quantity
                await product.save()
            }
        }

        invoice.status = "Cancelled"
        await invoice.save()

        res.json({ message: "Invoice cancelled successfully" })

    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}


// ✅ DOWNLOAD INVOICE PDF
exports.downloadInvoice = async (req, res) => {
    try {

        const { id } = req.params

        const invoice = await Invoice.findById(id)
            .populate('business')
            .populate('customer')

        if (!invoice) {
            return res.status(404).json({ message: "Invoice not found" })
        }

        generateInvoicePDF(invoice, res)

    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}


// ✅ GET SINGLE INVOICE
exports.getSingleInvoice = async (req, res) => {
    try {
        const { id } = req.params

        const invoice = await Invoice.findById(id)
            .populate('business')
            .populate('customer')

        if (!invoice) {
            return res.status(404).json({ message: "Invoice not found" })
        }

        res.json(invoice)

    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}


exports.getUserInvoices = async (req, res) => {
    try {
        const userId = req.user.id   // from protect middleware

        // ✅ find business of this user
        const business = await Business.findOne({ user: userId })

        if (!business) {
            return res.status(404).json({ message: "Business not found" })
        }

        // ✅ get invoices of that business
        const invoices = await Invoice.find({ business: business._id })
            .populate("customer")
            .sort({ createdAt: -1 })

        res.json(invoices)

    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}




