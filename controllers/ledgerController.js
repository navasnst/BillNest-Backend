const Ledger = require("../models/Ledger")

// ✅ Get all transactions
exports.getAllTransactions = async (req, res) => {
    try {
        const { businessId } = req.params

        const data = await Ledger.find({ business: businessId })
            .sort({ date: -1 })

        res.json(data)

    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}


// ✅ FIXED FULL SUMMARY
exports.getFullSummary = async (req, res) => {
    try {
        const { businessId } = req.params

        const data = await Ledger.find({ business: businessId })

        let summary = {
            sales: 0,
            purchase: 0,
            income: 0,
            expense: 0,
            cash: 0,
            bank: 0,
            receipt: 0,
            payment: 0,
            profit: 0
        }

        data.forEach(item => {
            const amt = item.amount

            // ✅ FIXED SOURCE MATCHING
            if (item.source === "Sales") summary.sales += amt
            if (item.source === "Purchase") summary.purchase += amt
            if (item.source === "Income") summary.income += amt
            if (item.source === "Expense") summary.expense += amt

            // ✅ Cash / Bank
            if (item.type === "Cash") {
                summary.cash += item.transactionType === "IN" ? amt : -amt
            }

            if (item.type === "Bank") {
                summary.bank += item.transactionType === "IN" ? amt : -amt
            }

            // ✅ Receipt / Payment
            if (item.source === "Receipt") summary.receipt += amt
            if (item.source === "Payment") summary.payment += amt
        })

        // ✅ Profit calculation
        summary.profit =
            summary.sales +
            summary.income -
            (summary.purchase + summary.expense)

        res.json(summary)

    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}