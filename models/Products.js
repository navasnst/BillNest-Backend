const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({

    business: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Business",
        required: true
    },

    name: {
        type: String,
        required: true
    },

    hsnCode: {
        type: String
    },

    price: {
        type: Number,
        required: true
    },

    gstRate: {
        type: Number,
        default: 0
    },

    stock: {
        type: Number,
        default: 0
    }

}, { timestamps: true })


module.exports = mongoose.model("Product", productSchema)