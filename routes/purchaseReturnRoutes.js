const express = require("express")
const router = express.Router()

const {
    createPurchaseReturn,
    getPurchaseReturns
} = require("../controllers/purchaseReturnController")

const protect = require("../middleware/authMiddleware")

router.post("/", protect, createPurchaseReturn)

router.get("/:businessId", protect, getPurchaseReturns)



module.exports = router