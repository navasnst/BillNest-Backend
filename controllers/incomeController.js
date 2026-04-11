const Income = require("../models/Income")
const Ledger = require("../models/Ledger")

// CREATE INCOME
exports.createIncome = async (req, res) => {
    try {

        const { businessId, source, amount, note, date } = req.body

        const income = await Income.create({
            business: businessId,
            source,
            amount,
            note,
            date
        })

        await Ledger.create({
            business: businessId,
            type: "Bank",
            amount,
            transactionType: "IN",
            source: "income",
            referenceId: income._id,
            note: source
        })

        res.status(201).json(income)

    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}


// GET INCOME
exports.getIncome = async (req, res) => {
    try {

        const { businessId } = req.params

        const income = await Income.find({ business: businessId })

        res.json(income)

    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}


// DELETE INCOME
exports.deleteIncome = async (req, res) => {
    try {

        const { id } = req.params

        await Income.findByIdAndDelete(id)

        res.json({ message: "Income deleted successfully" })

    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}