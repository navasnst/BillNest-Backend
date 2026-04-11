const express = require("express")
const router = express.Router()

const { registerUser, loginUser, getUser, updateUser, deleteUser } = require("../controllers/authController")
const protect = require("../middleware/authMiddleware")


router.post("/register", registerUser)
router.post("/login", loginUser)
router.get("/:id", protect, getUser)
router.patch("/update/:id", protect, updateUser)
router.delete("/delete/:id", protect, deleteUser)


module.exports = router
