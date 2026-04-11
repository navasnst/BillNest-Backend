const mongoose = require("mongoose")

const incomeSchema = new mongoose.Schema({
    business: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Business",
        required: true
    },

    source: {
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

module.exports = mongoose.model("Income", incomeSchema)