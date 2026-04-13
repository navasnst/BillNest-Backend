
const express = require('express');
const router = express.Router();

const { createInvoice, getInvoices, cancelInvoice, downloadInvoice, getSingleInvoice, getUserInvoices } = require('../controllers/invoiceController')
const protect = require('../middleware/authMiddleware')

// 🔥 MOST SPECIFIC FIRST
router.get('/my',protect, getUserInvoices)

router.get('/:id', protect, getSingleInvoice)
router.get('/download/:id', downloadInvoice)
router.put('/cancel/:id', protect, cancelInvoice)

// 🔥 THEN GENERAL GET
router.get('/business/:businessId', protect, getInvoices)

// 🔥 KEEP POST LAST 
router.post('/', protect, createInvoice)



module.exports = router