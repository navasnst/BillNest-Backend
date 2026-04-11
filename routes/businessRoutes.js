const express = require("express")
const router = express.Router()

const { createBusiness, getBusiness, updateBusiness, deleteBusiness } = require("../controllers/businessController")

const protect = require("../middleware/authMiddleware")

router.post("/", protect, createBusiness)
router.get("/", protect, getBusiness)
router.patch("/:id", protect, updateBusiness)
router.delete("/:id", protect, deleteBusiness)


module.exports = router
