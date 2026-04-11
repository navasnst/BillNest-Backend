const express = require("express");
const router = express.Router();

const {
  createPayment,
  getPayments,
  deletePayment,
} = require("../controllers/paymentController");

const protect = require("../middleware/authMiddleware");

router.post("/", protect, createPayment);
router.get("/:businessId", protect, getPayments);
router.delete("/:id", protect, deletePayment);

module.exports = router;
