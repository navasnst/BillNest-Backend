const mongoose = require("mongoose")

const receiptSchema = new mongoose.Schema({
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

    amount: {
        type: Number,
        required: true
    },

    paymentMode: {
        type: String,
        enum: ["Cash", "Bank", "UPI"],
        required: true
    },

    note: String,

    date: {
        type: Date,
        default: Date.now
    }

}, { timestamps: true })




module.exports = mongoose.model("Receipt", receiptSchema)
