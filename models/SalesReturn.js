const mongoose = require("mongoose")

const salesReturnItemSchema = new mongoose.Schema({
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

const salesReturnSchema = new mongoose.Schema({
    business: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Business",
        required: true
    },

    invoice: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Invoice",
        required: true
    },

    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Customer",
        required: true
    },

    returnNumber: {
        type: String,
        required: true
    },

    items: [salesReturnItemSchema],

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




module.exports = mongoose.model("SalesReturn", salesReturnSchema)