const express = require("express")
const router = express.Router()


const { createReceipt, getReceipts } = require("../controllers/receiptController")

const protect = require("../middleware/authMiddleware")

router.post("/", protect, createReceipt)

router.get("/:businessId", protect, getReceipts)



module.exports = router
