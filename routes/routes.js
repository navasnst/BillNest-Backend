const express = require("express")
const router = express.Router()

const {
    createSupplier,
    getSuppliers,
    deleteSupplier
} = require("../controllers/supplierController")

const protect = require("../middleware/authMiddleware")

router.post("/", protect, createSupplier)
router.get("/:businessId", protect, getSuppliers)
router.delete("/:id", protect, deleteSupplier)

module.exports = router