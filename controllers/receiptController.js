
const Receipt = require("../models/Receipt")
const Invoice = require("../models/Invoice")
const Ledger = require("../models/Ledger")

// ✅ CREATE RECEIPT (PAY DUE)
exports.createReceipt = async (req, res) => {
    try {

        const { invoiceId, amount, paymentMode, note } = req.body

        // ✅ validation
        if (!invoiceId || !amount || amount <= 0) {
            return res.status(400).json({ message: "Invalid payment data" })
        }

        const invoice = await Invoice.findById(invoiceId)

        if (!invoice) {
            return res.status(404).json({ message: "Invoice not found" })
        }

        if (invoice.status === "Cancelled") {
            return res.status(400).json({ message: "Invoice is cancelled" })
        }

        if (amount > invoice.dueAmount) {
            return res.status(400).json({
                message: "Amount exceeds due amount"
            })
        }

        // ✅ Create receipt
        const receipt = await Receipt.create({
            business: invoice.business,
            invoice: invoice._id,
            customer: invoice.customer,
            amount,
            paymentMode,
            note
        })

        // ✅ Update invoice
        invoice.paidAmount += amount
        invoice.dueAmount -= amount

        // ✅ payment status update (IMPORTANT)
        if (invoice.dueAmount === 0) {
            invoice.paymentStatus = "Paid"
        } else {
            invoice.paymentStatus = "Partial"
        }

        await invoice.save()

        // ✅ Ledger entry (FIXED SOURCE)
        await Ledger.create({
            business: invoice.business,
            type: paymentMode === "Cash" ? "Cash" : "Bank",
            amount,
            transactionType: "IN",
            source: "receipt",   // ✅ FIXED
            referenceId: receipt._id,
            note: "Customer payment received"
        })

        res.status(201).json({
            message: "Payment received successfully",
            receipt,
            updatedInvoice: {
                paidAmount: invoice.paidAmount,
                dueAmount: invoice.dueAmount,
                paymentStatus: invoice.paymentStatus
            }
        })

    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}


// ✅ GET RECEIPTS
exports.getReceipts = async (req, res) => {
    try {

        const { businessId } = req.params

        const receipts = await Receipt.find({ business: businessId })
            .populate("customer")
            .populate("invoice")
            .sort({ createdAt: -1 })

        res.json(receipts)

    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}