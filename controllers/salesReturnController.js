// const SalesReturn = require("../models/SalesReturn")
// const Invoice = require("../models/Invoice")
// const Product = require("../models/Products")

// exports.createSalesReturn = async (req, res) => {
//     try {

//         const { invoiceId, items, reason } = req.body

//         const invoice = await Invoice.findById(invoiceId)

//         if (!invoice) {
//             return res.status(404).json({ message: "Invoice not found" })
//         }

//         if (invoice.status === "Cancelled") {
//             return res.status(400).json({ message: "Invoice is cancelled" })
//         }

//         let subtotal = 0
//         let totalGST = 0
//         let returnItems = []

//         for (let item of items) {

//             const product = await Product.findById(item.productId)

//             if (!product) {
//                 return res.status(404).json({ message: "Product not found" })
//             }

//             const itemTotal = product.price * item.quantity
//             const gstAmount = (itemTotal * product.gstRate) / 100

//             subtotal += itemTotal
//             totalGST += gstAmount

//             returnItems.push({
//                 product: product._id,
//                 name: product.name,
//                 quantity: item.quantity,
//                 price: product.price,
//                 gstRate: product.gstRate,
//                 gstAmount,
//                 total: itemTotal + gstAmount
//             })

//             // ✅ Increase stock
//             product.stock += item.quantity
//             await product.save()
//         }

//         // GST split (same as invoice)
//         let cgst = 0
//         let sgst = 0
//         let igst = 0

//         if (invoice.isGSTInvoice) {
//             const businessState = invoice.business.state
//             const customerState = invoice.customer.state

//             if (businessState === customerState) {
//                 cgst = totalGST / 2
//                 sgst = totalGST / 2
//             } else {
//                 igst = totalGST
//             }
//         }

//         const grandTotal = subtotal + totalGST

//         // Return Number
//         const count = await SalesReturn.countDocuments()
//         const returnNumber = `SR-${String(count + 1).padStart(3, "0")}`

//         const salesReturn = await SalesReturn.create({
//             business: invoice.business,
//             invoice: invoice._id,
//             customer: invoice.customer,
//             returnNumber,
//             items: returnItems,
//             subtotal,
//             cgst,
//             sgst,
//             igst,
//             totalGST,
//             grandTotal,
//             reason
//         })

//         res.status(201).json(salesReturn)

//     } catch (error) {
//         res.status(500).json({ error: error.message })
//     }
// }



// exports.getSalesReturns = async (req, res) => {
//     try {

//         const { businessId } = req.params

//         const returns = await SalesReturn.find({ business: businessId })
//             .populate("customer")
//             .populate("invoice")
//             .sort({ createdAt: -1 })

//         res.json(returns)

//     } catch (error) {
//         res.status(500).json({ error: error.message })
//     }
// }






const SalesReturn = require("../models/SalesReturn")
const Invoice = require("../models/Invoice")
const Product = require("../models/Products")

exports.createSalesReturn = async (req, res) => {
    try {

        const { invoiceId, items, reason } = req.body

        // ✅ FIX: populate business & customer
        const invoice = await Invoice.findById(invoiceId)
            .populate("business")
            .populate("customer")

        if (!invoice) {
            return res.status(404).json({ message: "Invoice not found" })
        }

        if (invoice.status === "Cancelled") {
            return res.status(400).json({ message: "Invoice is cancelled" })
        }

        let subtotal = 0
        let totalGST = 0
        let returnItems = []

        for (let item of items) {

            const product = await Product.findById(item.productId)

            if (!product) {
                return res.status(404).json({ message: "Product not found" })
            }

            const itemTotal = product.price * item.quantity
            const gstAmount = (itemTotal * product.gstRate) / 100

            subtotal += itemTotal
            totalGST += gstAmount

            returnItems.push({
                product: product._id,
                name: product.name,
                quantity: item.quantity,
                price: product.price,
                gstRate: product.gstRate,
                gstAmount,
                total: itemTotal + gstAmount
            })

            // ✅ Increase stock
            product.stock += item.quantity
            await product.save()
        }

        // ✅ GST split (NOW WORKS CORRECTLY)
        let cgst = 0
        let sgst = 0
        let igst = 0

        if (invoice.isGSTInvoice) {
            const businessState = invoice.business.state
            const customerState = invoice.customer.state

            if (businessState?.toLowerCase() === customerState?.toLowerCase()) {
                cgst = totalGST / 2
                sgst = totalGST / 2
            } else {
                igst = totalGST
            }
        }

        const grandTotal = subtotal + totalGST

        // ✅ Return Number
        const count = await SalesReturn.countDocuments()
        const returnNumber = `SR-${String(count + 1).padStart(3, "0")}`

        const salesReturn = await SalesReturn.create({
            business: invoice.business._id, // ✅ safer
            invoice: invoice._id,
            customer: invoice.customer._id,
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

        res.status(201).json(salesReturn)

    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}


exports.getSalesReturns = async (req, res) => {
    try {

        const { businessId } = req.params

        const returns = await SalesReturn.find({ business: businessId })
            .populate("customer")
            .populate("invoice")
            .sort({ createdAt: -1 })

        res.json(returns)

    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}