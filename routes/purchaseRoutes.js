const express = require('express');
const router = express.Router();

const {createPurchase, getPurchases, deletePurchase} = require("../controllers/purchaseController")

const protect = require("../middleware/authMiddleware")

router.post("/", protect, createPurchase)
router.get("/:businessId", protect, getPurchases)
router.delete("/:id", protect, deletePurchase)


module.exports = router