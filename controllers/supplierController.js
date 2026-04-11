const Supplier = require("../models/Supplier")

// CREATE
exports.createSupplier = async (req, res) => {
    try {
        const { businessId, name, phone, email, address } = req.body

        const supplier = await Supplier.create({
            business: businessId,
            name,
            phone,
            email,
            address
        })

        res.status(201).json(supplier)

    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

// GET
exports.getSuppliers = async (req, res) => {
    try {
        const { businessId } = req.params

        const suppliers = await Supplier.find({ business: businessId })

        res.json(suppliers)

    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

// DELETE
exports.deleteSupplier = async (req, res) => {
    try {
        const { id } = req.params

        await Supplier.findByIdAndDelete(id)

        res.json({ message: "Supplier deleted" })

    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}