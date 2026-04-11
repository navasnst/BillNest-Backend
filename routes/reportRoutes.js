const express = require("express")
const router = express.Router()

const {
    getDashboardStats,
    getDailyReport,
    getMonthlyReport,
    getProfitLoss,
    getBalanceSheet,
    getGSTReport
} = require("../controllers/reportController")

const protect = require("../middleware/authMiddleware")

router.get("/dashboard/:businessId", protect, getDashboardStats)
router.get("/daily/:businessId", protect, getDailyReport)
router.get("/monthly/:businessId", protect, getMonthlyReport)

router.get("/pl/:businessId", protect, getProfitLoss)
router.get("/balanceSheet/:businessId", protect, getBalanceSheet)
router.get("/gst/:businessId", protect, getGSTReport)



module.exports = router