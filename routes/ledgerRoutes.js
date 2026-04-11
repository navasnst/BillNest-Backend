// const express = require("express")
// const router = express.Router()

// const { getLedgerSummary } = require("../controllers/ledgerController")

// const protect = require("../middleware/authMiddleware")

// router.get("/summary/:businessId", protect, getLedgerSummary)



// module.exports = router





const express = require("express")
const router = express.Router()

const {
    getAllTransactions,
    getFullSummary
} = require("../controllers/ledgerController")

const protect = require("../middleware/authMiddleware")

router.get("/:businessId", protect, getAllTransactions)
router.get("/full-summary/:businessId", protect, getFullSummary)

module.exports = router