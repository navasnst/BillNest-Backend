const Customer = require("../models/Customer")


//CREATE CUSTOMER

exports.createCustomer = async (req, res) => {
    try {
        const { name, phone, email, gstNumber, address, state, businessId } = req.body
        

        const customer = await Customer.create({
            name,
            phone,
            email,
            gstNumber,
            address,
            state,
            business: businessId

        })

        res.status(201).json(customer)

    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}



//GET CUSTOMERS

exports.getCustomers = async (req, res) => {
    try {
        const { businessId } = req.params

        const customers = await Customer.find({ business: businessId })

        res.json(customers)

    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}


//UPDATE CUSTOMER

exports.updateCustomer = async (req, res) => {
    try {
        const { id } = req.params

        const customer = await Customer.findByIdAndUpdate(id, req.body, { new: true })

        res.json(customer)

    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}



//DELETE CUSTOMER

exports.deleteCustomer = async (req, res) => {
    try {
        const { id } = req.params

        await Customer.findByIdAndDelete(id)

        res.json({ message: "Customer deleted successfully" })

    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}