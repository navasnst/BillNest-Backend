const mongoose = require("mongoose")

const quickInvoiceSchema = new mongoose.Schema({
    invoiceNumber: {
        type: String,
        required: true
    },

    date: {
        type: String,
        default: () => new Date().toLocaleString()
    },

    customerName: {
        type: String,
        default: "Walk-in Customer"
    },

    items: [
        {
            name: { type: String, required: true },
            qty: { type: Number, required: true },
            price: { type: Number, required: true },
            total: { type: Number, required: true }
        }
    ],

    totalAmount: {
        type: Number,
        required: true
    },

    type: {
        type: String,
        default: "quick"
    }

}, { timestamps: true })

module.exports = mongoose.model("QuickInvoice", quickInvoiceSchema)