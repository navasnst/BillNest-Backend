const express = require("express")
const router = express.Router()

const { createIncome, getIncome, deleteIncome } = require("../controllers/incomeController")

const protect = require("../middleware/authMiddleware")

router.post("/", protect, createIncome)

router.get("/:businessId", protect, getIncome)

router.delete("/:id", protect, deleteIncome)



module.exports = router