const mongoose = require('mongoose');

const invoiceItemSchema = new mongoose.Schema({

    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
    },

    name: {
        type: String,
    },

    quantity: Number,

    price: Number,

    gstRate: Number,

    gstAmount: Number,

    total: Number
})


const invoiceSchema = new mongoose.Schema({

    business: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Business",
        required: true
    },

    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Customer",
        required: true
    },

    invoiceNumber: {
        type: String,
        required: true
    },

    items: [invoiceItemSchema],

    subtotal: Number,

    cgst: Number,

    sgst: Number,

    igst: Number,

    grandTotal: Number,

    paymentMode: {
        type: String,
        enum: ["Cash", "Bank", "UPI", "Credit"],
        default: "Cash"
    },

    paidAmount: {
        type: Number,
        default: 0
    },

    dueAmount: {
        type: Number,
        default: 0
    },

    paymentStatus: {
        type: String,
        enum: ["Paid", "Partially Paid", "Unpaid"],
        default: "Paid"
    },

    status: {
        type: String,
        enum: ["Active", "Cancelled"],
        default: "Active"
    },

    isGSTInvoice: {
        type: Boolean,
        default: true
    },

    invoiceDate: {
        type: Date,
        default: Date.now
    }

}, { timestamps: true })



module.exports = mongoose.model("Invoice", invoiceSchema)
