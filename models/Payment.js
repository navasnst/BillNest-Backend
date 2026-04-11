const mongoose = require("mongoose")

const paymentSchema = new mongoose.Schema({
    business: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Business",
        required: true
    },

    supplier: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Supplier",
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


    referenceId: {
        type: mongoose.Schema.Types.ObjectId,
        default: null
    },

    date: {
        type: Date,
        default: Date.now
    }

}, { timestamps: true })

module.exports = mongoose.model("Payment", paymentSchema)