
const PurchaseReturn = require("../models/PurchaseReturn")
const Purchase = require("../models/Purchase")
const Product = require("../models/Products")
const Ledger = require("../models/Ledger")

exports.createPurchaseReturn = async (req, res) => {
    try {

        const { purchaseId, items, reason } = req.body

        const purchase = await Purchase.findById(purchaseId)

        if (!purchase) {
            return res.status(404).json({ message: "Purchase not found" })
        }

        let subtotal = 0
        let totalGST = 0
        let returnItems = []

        for (let item of items) {

            const product = await Product.findById(item.productId)

            if (!product) {
                return res.status(404).json({ message: "Product not found" })
            }

            // ✅ CHECK FROM PURCHASE (FIXED)
            const purchaseItem = purchase.items.find(
                p => p.product.toString() === item.productId
            )

            if (!purchaseItem) {
                return res.status(400).json({ message: "Product not in purchase" })
            }

            if (item.quantity > purchaseItem.quantity) {
                return res.status(400).json({
                    message: `Return exceeds purchased qty for ${product.name}`
                })
            }

            const itemTotal = purchaseItem.price * item.quantity
            const gstAmount = (itemTotal * product.gstRate) / 100

            subtotal += itemTotal
            totalGST += gstAmount

            returnItems.push({
                product: product._id,
                name: product.name,
                quantity: item.quantity,
                price: purchaseItem.price, // ✅ FIXED
                gstRate: product.gstRate,
                gstAmount,
                total: itemTotal + gstAmount
            })

            // ✅ Reduce stock
            product.stock -= item.quantity
            await product.save()
        }

        let cgst = totalGST / 2
        let sgst = totalGST / 2
        let igst = 0

        const grandTotal = subtotal + totalGST

        const count = await PurchaseReturn.countDocuments()
        const returnNumber = `PR-${String(count + 1).padStart(3, "0")}`

        const purchaseReturn = await PurchaseReturn.create({
            business: purchase.business,
            purchase: purchase._id,
            supplierName: purchase.supplierName,
            returnNumber,
            items: returnItems,
            subtotal,
            cgst,
            sgst,
            igst,
            totalGST,
            grandTotal,
            reason
        })

        // ✅ LEDGER ENTRY (IMPORTANT)
        await Ledger.create({
            business: purchase.business,
            type: "Cash",
            amount: grandTotal,
            transactionType: "IN",
            source: "purchase",
            referenceId: purchaseReturn._id,
            note: "Purchase return refund"
        })

        res.status(201).json(purchaseReturn)

    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}


exports.getPurchaseReturns = async (req, res) => {
    try {

        const { businessId } = req.params

        const returns = await PurchaseReturn.find({ business: businessId })
            .populate("purchase")
            .sort({ createdAt: -1 })

        res.json(returns)

    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}
