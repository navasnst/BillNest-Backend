
const Ledger = require("../models/Ledger")

exports.addCapital = async (req, res) => {
    try {
        const { businessId, amount, type, note } = req.body

        if (!businessId || !amount || !type) {
            return res.status(400).json({ message: "All fields required" })
        }

        const entry = await Ledger.create({
            business: businessId,
            type, // Cash or Bank
            amount,
            transactionType: "IN",
            source: "capital", // ✅ FIXED
            note: note || "Initial Capital"
        })

        res.status(201).json(entry)

    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}