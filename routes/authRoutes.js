const express = require("express")
const router = express.Router()

const { registerUser, loginUser, getUser, updateUser, deleteUser, forgotPassword, resetPassword } = require("../controllers/authController")
const protect = require("../middleware/authMiddleware")


router.post("/register", registerUser)
router.post("/login", loginUser)
router.post("/forgot-password", forgotPassword)
router.post("/reset-password/:token", resetPassword)
router.get("/:id", protect, getUser)
router.patch("/update/:id", protect, updateUser)
router.delete("/delete/:id", protect, deleteUser)


module.exports = router
