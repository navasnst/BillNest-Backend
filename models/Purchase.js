const mongoose = require("mongoose")

const purchaseItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
    },
    name: String,
    quantity: Number,
    price: Number,
    gstRate: Number,
    gstAmount: Number,
    total: Number
})

const purchaseSchema = new mongoose.Schema({
    business: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Business",
        required: true
    },

    purchaseNumber: {
        type: String,
        required: true
    },

    supplierName: String,

    items: [purchaseItemSchema],

    subtotal: Number,

    cgst: Number,
    sgst: Number,
    igst: Number,

    totalGST: Number,
    grandTotal: Number,

    paidAmount: {
        type: Number,
        default: 0
    },

    dueAmount: {
        type: Number,
        default: 0
    },

    date: {
        type: Date,
        default: Date.now
    }

}, { timestamps: true })

module.exports = mongoose.model("Purchase", purchaseSchema)