const Product = require("../models/Products")


// Create a new product

exports.createProduct = async (req, res) => {
    try {
        const { name, hsnCode, price, gstRate, stock, businessId } = req.body

        const product = await Product.create({
            name,
            hsnCode,
            price,
            gstRate,
            stock,
            business: businessId
        })

        res.status(201).json(product)

    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}


//GET PRODUCTS BY BUSINESS 

exports.getProducts = async (req, res) => {
    try {
        const { businessId } = req.params

        const products = await Product.find({ business: businessId })

        res.status(200).json(products)

    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}


// Update a product

exports.updateProduct = async (req, res) => {
    try {
        const { id } = req.params

        const product = await Product.findByIdAndUpdate(id, req.body, { new: true })

        res.status(200).json(product)

    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}


// Delete a product

exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params

        await Product.findByIdAndDelete(id)

        res.status(200).json({ message: "Product Deleted Successfully" })

    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}