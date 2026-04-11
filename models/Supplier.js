const mongoose = require("mongoose")

const supplierSchema = new mongoose.Schema({
    business: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Business",
        required: true
    },

    name: {
        type: String,
        required: true
    },

    phone: String,
    email: String,
    address: String,

}, { timestamps: true })

module.exports = mongoose.model("Supplier", supplierSchema)