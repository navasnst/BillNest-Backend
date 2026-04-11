const mongoose = require("mongoose")

const businessSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    businessName: {
        type: String,
        required: true
    },

    gstNumber: {
        type: String,
    },

    phone: {
        type: String,
    },

    address: {
        type: String
    },

    state:{
        type: String
    }

}, { timestamps: true })



module.exports = mongoose.model("Business", businessSchema)