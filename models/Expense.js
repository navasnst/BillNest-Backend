const mongoose = require("mongoose")

const expenseSchema = new mongoose.Schema({
    business: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Business",
        required: true
    },

    category: {
        type: String,
        required: true
    },

    amount: {
        type: Number,
        required: true
    },

    note: String,

    date: {
        type: Date,
        default: Date.now
    }

}, { timestamps: true })

module.exports = mongoose.model("Expense", expenseSchema)