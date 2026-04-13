
const mongoose = require("mongoose")
const Invoice = require("../models/Invoice")
const Purchase = require("../models/Purchase")
const Expense = require("../models/Expense")
const Income = require("../models/Income")
const Ledger = require("../models/Ledger")


// 📊 DASHBOARD
exports.getDashboardStats = async (req, res) => {
    try {
        const { businessId } = req.params
        const objectId = new mongoose.Types.ObjectId(businessId)

        // ✅ SALES
        const sales = await Invoice.aggregate([
            { $match: { business: objectId, status: { $ne: "Cancelled" } } },
            {
                $group: {
                    _id: null,
                    totalSales: { $sum: "$grandTotal" },
                    outputGST: { $sum: { $add: ["$cgst", "$sgst", "$igst"] } },
                    totalInvoices: { $sum: 1 }
                }
            }
        ])

        // ✅ PURCHASE
        const purchase = await Purchase.aggregate([
            { $match: { business: objectId } },
            {
                $group: {
                    _id: null,
                    totalPurchase: { $sum: "$grandTotal" },
                    inputGST: { $sum: "$totalGST" }
                }
            }
        ])

        // ✅ EXPENSE
        const expense = await Expense.aggregate([
            { $match: { business: objectId } },
            { $group: { _id: null, totalExpense: { $sum: "$amount" } } }
        ])

        // ✅ INCOME
        const income = await Income.aggregate([
            { $match: { business: objectId } },
            { $group: { _id: null, totalIncome: { $sum: "$amount" } } }
        ])

        const totalSales = sales[0]?.totalSales || 0
        const outputGST = sales[0]?.outputGST || 0
        const totalInvoices = sales[0]?.totalInvoices || 0

        const totalPurchase = purchase[0]?.totalPurchase || 0
        const inputGST = purchase[0]?.inputGST || 0

        const totalExpense = expense[0]?.totalExpense || 0
        const totalOtherIncome = income[0]?.totalIncome || 0

        const netGST = outputGST - inputGST

        const profit =
            totalSales - totalPurchase - totalExpense + totalOtherIncome

        res.json({
            totalSales,
            outputGST,
            inputGST,
            netGST,
            totalInvoices,
            totalPurchase,
            totalExpense,
            totalOtherIncome,
            profit
        })

    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}


// 📅 DAILY REPORT
exports.getDailyReport = async (req, res) => {
    try {
        const objectId = new mongoose.Types.ObjectId(req.params.businessId)

        const report = await Invoice.aggregate([
            { $match: { business: objectId, status: { $ne: "Cancelled" } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    totalSales: { $sum: "$grandTotal" },
                    totalInvoices: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ])

        res.json(report)

    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}


// 📆 MONTHLY REPORT
exports.getMonthlyReport = async (req, res) => {
    try {
        const objectId = new mongoose.Types.ObjectId(req.params.businessId)

        const report = await Invoice.aggregate([
            { $match: { business: objectId, status: { $ne: "Cancelled" } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
                    totalSales: { $sum: "$grandTotal" },
                    totalInvoices: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ])

        res.json(report)

    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}


// 📄 PROFIT & LOSS
exports.getProfitLoss = async (req, res) => {
    try {
        const objectId = new mongoose.Types.ObjectId(req.params.businessId)

        const sales = await Invoice.aggregate([
            { $match: { business: objectId, status: { $ne: "Cancelled" } } },
            { $group: { _id: null, total: { $sum: "$grandTotal" } } }
        ])

        const purchase = await Purchase.aggregate([
            { $match: { business: objectId } },
            { $group: { _id: null, total: { $sum: "$grandTotal" } } }
        ])

        const expense = await Expense.aggregate([
            { $match: { business: objectId } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ])

        const income = await Income.aggregate([
            { $match: { business: objectId } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ])

        const totalSales = sales[0]?.total || 0
        const totalPurchase = purchase[0]?.total || 0
        const totalExpense = expense[0]?.total || 0
        const totalIncome = income[0]?.total || 0

        const profit =
            totalSales - totalPurchase - totalExpense + totalIncome

        res.json({
            totalSales,
            totalPurchase,
            totalExpense,
            totalIncome,
            profit
        })

    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}


// 📊 BALANCE SHEET (UPDATED ✅)
exports.getBalanceSheet = async (req, res) => {
    try {
        const objectId = new mongoose.Types.ObjectId(req.params.businessId)

        // ✅ CASH
        const cash = await Ledger.aggregate([
            { $match: { business: objectId, type: "Cash" } },
            {
                $group: {
                    _id: null,
                    balance: {
                        $sum: {
                            $cond: [
                                { $eq: ["$transactionType", "IN"] },
                                "$amount",
                                { $multiply: ["$amount", -1] }
                            ]
                        }
                    }
                }
            }
        ])

        // ✅ BANK
        const bank = await Ledger.aggregate([
            { $match: { business: objectId, type: "Bank" } },
            {
                $group: {
                    _id: null,
                    balance: {
                        $sum: {
                            $cond: [
                                { $eq: ["$transactionType", "IN"] },
                                "$amount",
                                { $multiply: ["$amount", -1] }
                            ]
                        }
                    }
                }
            }
        ])

        // ✅ RECEIVABLES (CUSTOMER DUE)
        const receivables = await Invoice.aggregate([
            { $match: { business: objectId, status: { $ne: "Cancelled" } } },
            { $group: { _id: null, totalDue: { $sum: "$dueAmount" } } }
        ])

        // ✅ PAYABLES (SUPPLIER DUE) 🔥 NEW
        const payables = await Purchase.aggregate([
            { $match: { business: objectId } },
            { $group: { _id: null, total: { $sum: "$grandTotal" } } }
        ])

        const cashBalance = cash[0]?.balance || 0
        const bankBalance = bank[0]?.balance || 0
        const receivable = receivables[0]?.totalDue || 0
        const payable = payables[0]?.total || 0

        const totalAssets = cashBalance + bankBalance + receivable
        const totalLiabilities = payable

        res.json({
            assets: {
                cash: cashBalance,
                bank: bankBalance,
                receivables: receivable,
                totalAssets
            },
            liabilities: {
                payables: payable,
                totalLiabilities
            }
        })

    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}


// 🧾 GST REPORT
exports.getGSTReport = async (req, res) => {
    try {
        const objectId = new mongoose.Types.ObjectId(req.params.businessId)

        // OUTPUT GST
        const salesGST = await Invoice.aggregate([
            { $match: { business: objectId, status: { $ne: "Cancelled" } } },
            {
                $group: {
                    _id: null,
                    cgst: { $sum: "$cgst" },
                    sgst: { $sum: "$sgst" },
                    igst: { $sum: "$igst" }
                }
            }
        ])

        // INPUT GST
        const purchaseGST = await Purchase.aggregate([
            { $match: { business: objectId } },
            {
                $group: {
                    _id: null,
                    cgst: { $sum: "$cgst" },
                    sgst: { $sum: "$sgst" },
                    igst: { $sum: "$igst" }
                }
            }
        ])

        const output = salesGST[0] || { cgst: 0, sgst: 0, igst: 0 }
        const input = purchaseGST[0] || { cgst: 0, sgst: 0, igst: 0 }

        const totalOutputGST = output.cgst + output.sgst + output.igst
        const totalInputGST = input.cgst + input.sgst + input.igst

        const netGST = totalOutputGST - totalInputGST

        res.json({
            outputGST: output,
            inputGST: input,
            totalOutputGST,
            totalInputGST,
            netGST
        })

    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}