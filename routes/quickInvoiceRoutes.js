const express = require("express")
const router = express.Router()
const QuickInvoice = require("../models/QuickInvoice")

// CREATE QUICK INVOICE
router.post("/invoice/quick", async (req, res) => {
    try {
        const { invoiceNumber, items, totalAmount } = req.body

        // Validation
        if (!items || items.length === 0) {
            return res.status(400).json({ message: "No items added" })
        }

        if (!invoiceNumber) {
            return res.status(400).json({ message: "Invoice number required" })
        }

        const invoice = await QuickInvoice.create(req.body)

        res.status(201).json(invoice)
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: "Error saving invoice" })
    }
})


// GET ALL QUICK INVOICES (for history later)
router.get("/invoice/quick", async (req, res) => {
    try {
        const invoices = await QuickInvoice.find().sort({ createdAt: -1 })
        res.json(invoices)
    } catch (err) {
        res.status(500).json({ message: "Error fetching invoices" })
    }
})


// DELETE QUICK INVOICE
router.delete("/invoice/quick/:id", async (req, res) => {
    try {
        await QuickInvoice.findByIdAndDelete(req.params.id)
        res.json({ message: "Invoice deleted" })
    } catch (err) {
        res.status(500).json({ message: "Error deleting invoice" })
    }
})

module.exports = router