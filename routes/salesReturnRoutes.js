const express = require("express")
const router = express.Router()

const { createSalesReturn, getSalesReturns } = require("../controllers/salesReturnController")

const protect = require("../middleware/authMiddleware")

router.post("/", protect, createSalesReturn)

router.get("/:businessId", protect, getSalesReturns)



module.exports = router