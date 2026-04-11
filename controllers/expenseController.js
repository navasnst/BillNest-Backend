const Expense = require("../models/Expense")
const Ledger = require("../models/Ledger")


exports.createExpense = async (req, res) => {
    try {
        const { businessId, category, amount, note, date } = req.body

        const expense = await Expense.create({
            business: businessId,
            category,
            amount,
            note,
            date
        })

        await Ledger.create({
            business: businessId,
            type: paymentMode === "Cash" ? "Cash" : "Bank",
            amount,
            transactionType: "OUT",
            source: "expense",
            note: category
        })

        res.status(201).json(expense)

    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}



exports.getExpense = async (req, res) => {
    try {
        const { businessId } = req.params

        const expenses = await Expense.find({ business: businessId })

        res.json(expenses)

    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}




exports.deleteExpense = async (req, res) => {
    try {

        const { id } = req.params

        await Expense.findByIdAndDelete(id)

        res.json({ message: "Expense deleted successfully" })

    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}