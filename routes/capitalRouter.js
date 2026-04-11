const express= require('express');
const router = express.Router();

const { addCapital } = require("../controllers/capitalController")

const protect = require('../middleware/authMiddleware');

router.post("/capital", protect, addCapital);



module.exports = router