const express = require('express');
const router = express.Router();

const { createProduct, getProducts, updateProduct, deleteProduct } = require("../controllers/productController")

const protect = require("../middleware/authMiddleware")

router.post("/", protect, createProduct)
router.get("/:businessId", protect, getProducts)
router.put("/:id", protect, updateProduct)
router.delete("/:id", protect, deleteProduct)


module.exports = router