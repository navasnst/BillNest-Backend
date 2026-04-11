const express = require("express")
const router = express.Router()

const { createExpense, getExpense, deleteExpense } = require("../controllers/expenseController")


const protect = require("../middleware/authMiddleware")


router.post("/", protect, createExpense)
router.get("/:businessId", protect, getExpense)
router.delete("/:id", protect, deleteExpense)



module.exports = router