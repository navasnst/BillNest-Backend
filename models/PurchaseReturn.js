const mongoose = require("mongoose")

const purchaseReturnItemSchema = new mongoose.Schema({
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

const purchaseReturnSchema = new mongoose.Schema({
    business: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Business",
        required: true
    },

    purchase: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Purchase",
        required: true
    },

    returnNumber: {
        type: String,
        required: true
    },

    supplierName: String,

    items: [purchaseReturnItemSchema],

    subtotal: Number,

    cgst: Number,
    sgst: Number,
    igst: Number,

    totalGST: Number,
    grandTotal: Number,

    reason: String,

    date: {
        type: Date,
        default: Date.now
    }

}, { timestamps: true })



module.exports = mongoose.model("PurchaseReturn", purchaseReturnSchema)