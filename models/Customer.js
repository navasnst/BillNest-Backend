const mongoose = require("mongoose")

const customerSchema = new mongoose.Schema({
    business: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Business",
        required: true
    },

    name: {
        type: String,
        required: true
    },

    phone: {
        type: String
    },

    email: {
        type: String
    },

    gstNumber: {
        type: String
    },

    address: {
        type: String
    },

    state: {
        type: String,
        default: "Kerala"
    }


}, { timestamps: true })



module.exports = mongoose.model("Customer", customerSchema)
