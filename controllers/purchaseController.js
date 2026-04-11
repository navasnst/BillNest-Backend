const Purchase = require("../models/Purchase")
const Product = require("../models/Products")
const Business = require("../models/Business")
const Ledger = require("../models/Ledger")

// exports.createPurchase = async (req, res) => {
//     try {

//         const { businessId, supplierName, items } = req.body

//         const business = await Business.findById(businessId)

//         if (!business) {
//             return res.status(404).json({ message: "Business not found" })
//         }

//         const isGSTRegistered = business.gstNumber && business.gstNumber !== ""

//         let subtotal = 0
//         let totalGST = 0
//         let purchaseItems = []

//         for (let item of items) {

//             const product = await Product.findOne({
//                 _id: item.productId,
//                 business: businessId
//             })

//             if (!product) {
//                 return res.status(404).json({ message: "Product not found" })
//             }

//             const itemTotal = item.price * item.quantity

//             let gstAmount = 0

//             if (isGSTRegistered) {
//                 gstAmount = (itemTotal * product.gstRate) / 100
//             }

//             subtotal += itemTotal
//             totalGST += gstAmount

//             purchaseItems.push({
//                 product: product._id,
//                 name: product.name,
//                 quantity: item.quantity,
//                 price: item.price,
//                 gstRate: isGSTRegistered ? product.gstRate : 0,
//                 gstAmount,
//                 total: itemTotal + gstAmount
//             })

//             // ✅ Increase stock
//             product.stock += item.quantity
//             await product.save()
//         }

//         // ✅ GST Split
//         let cgst = 0
//         let sgst = 0
//         let igst = 0

//         if (isGSTRegistered) {
//             // For now assume same state purchase
//             cgst = totalGST / 2
//             sgst = totalGST / 2

//             // (Later you can add supplier state for IGST)
//         }

//         const grandTotal = subtotal + totalGST

//         // ✅ Purchase Number (Daily sequence)
//         const today = new Date()
//         today.setHours(0, 0, 0, 0)

//         const tomorrow = new Date(today)
//         tomorrow.setDate(tomorrow.getDate() + 1)

//         const count = await Purchase.countDocuments({
//             createdAt: {
//                 $gte: today,
//                 $lt: tomorrow
//             }
//         })

//         const sequence = String(count + 1).padStart(3, "0")

//         const purchaseNumber = `PUR-${today.toISOString().slice(0, 10)}/${sequence}`

//         const purchase = await Purchase.create({
//             business: businessId,
//             purchaseNumber,
//             supplierName,
//             items: purchaseItems,
//             subtotal,
//             cgst,
//             sgst,
//             igst,
//             totalGST,
//             grandTotal
//         })

//         await Ledger.create({
//             business: businessId,
//             type: "Bank", // usually purchase via bank
//             amount: grandTotal,
//             transactionType: "OUT",
//             source: "Purchase",
//             referenceId: purchase._id,
//             note: "Purchase payment"
//         })

//         res.status(201).json(purchase)

//     } catch (error) {
//         res.status(500).json({ error: error.message })
//     }
// }




exports.createPurchase = async (req, res) => {
    try {

        const { businessId, supplierName, items, paymentMode, paidAmount } = req.body

        const business = await Business.findById(businessId)

        if (!business) {
            return res.status(404).json({ message: "Business not found" })
        }

        const isGSTRegistered = business.gstNumber && business.gstNumber !== ""

        let subtotal = 0
        let totalGST = 0
        let purchaseItems = []

        for (let item of items) {

            const product = await Product.findOne({
                _id: item.productId,
                business: businessId
            })

            if (!product) {
                return res.status(404).json({ message: "Product not found" })
            }

            const itemTotal = item.price * item.quantity

            let gstAmount = 0

            if (isGSTRegistered) {
                gstAmount = (itemTotal * product.gstRate) / 100
            }

            subtotal += itemTotal
            totalGST += gstAmount

            purchaseItems.push({
                product: product._id,
                name: product.name,
                quantity: item.quantity,
                price: item.price,
                gstRate: isGSTRegistered ? product.gstRate : 0,
                gstAmount,
                total: itemTotal + gstAmount
            })

            product.stock += item.quantity
            await product.save()
        }

        // ✅ GST Split (basic)
        let cgst = 0, sgst = 0, igst = 0

        if (isGSTRegistered) {
            cgst = totalGST / 2
            sgst = totalGST / 2
        }

        const grandTotal = subtotal + totalGST

        // ✅ PAYMENT LOGIC
        const paid = paidAmount || 0
        const due = grandTotal - paid

        if (paid > grandTotal) {
            return res.status(400).json({
                message: "Paid amount cannot exceed total"
            })
        }

        // ✅ Purchase Number
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const count = await Purchase.countDocuments({
            createdAt: {
                $gte: today,
                $lt: new Date(today.getTime() + 86400000)
            }
        })

        const purchaseNumber = `PUR-${today.toISOString().slice(0, 10)}/${String(count + 1).padStart(3, "0")}`

        const purchase = await Purchase.create({
            business: businessId,
            purchaseNumber,
            supplierName,
            items: purchaseItems,
            subtotal,
            cgst,
            sgst,
            igst,
            totalGST,
            grandTotal,
            paidAmount: paid,
            dueAmount: due
        })

        // ✅ ONLY if money paid → Ledger entry
        if (paid > 0) {
            await Ledger.create({
                business: businessId,
                type: paymentMode === "Cash" ? "Cash" : "Bank",
                amount: paid,
                transactionType: "OUT",
                source: "purchase",
                referenceId: purchase._id,
                note: "Purchase payment"
            })
        }

        res.status(201).json(purchase)

    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}


exports.getPurchases = async (req, res) => {
    try {

        const { businessId } = req.params

        const purchases = await Purchase.find({ business: businessId })

        res.json(purchases)

    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}




exports.deletePurchase = async (req, res) => {
    try {

        const { id } = req.params

        const purchase = await Purchase.findById(id)

        if (!purchase) {
            return res.status(404).json({ message: "Purchase not found" })
        }

        // 🔁 Restore stock
        for (let item of purchase.items) {
            const product = await Product.findById(item.product)
            product.stock -= item.quantity
            await product.save()
        }

        await Purchase.findByIdAndDelete(id)

        res.json({ message: "Purchase deleted successfully" })

    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}