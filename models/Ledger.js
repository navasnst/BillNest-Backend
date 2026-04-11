
const mongoose = require("mongoose")

const ledgerSchema = new mongoose.Schema({
    business: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Business",
        required: true
    },

    type: {
        type: String,
        enum: ["Cash", "Bank"],
        required: true
    },

    amount: {
        type: Number,
        required: true
    },

    transactionType: {
        type: String,
        enum: ["IN", "OUT"],
        required: true
    },

    source: {
        type: String,
        enum: ["invoice", "purchase", "income", "expense", "receipt", "payment", "capital"],
        required: true
    },

    referenceId: {
        type: mongoose.Schema.Types.ObjectId,
        default: null
    },

    note: String,

    date: {
        type: Date,
        default: Date.now
    }

}, { timestamps: true })

module.exports = mongoose.model("Ledger", ledgerSchema)