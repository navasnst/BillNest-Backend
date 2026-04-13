const express = require("express")
const cors = require("cors")
require("dotenv").config()

const connectDB = require("./config/db")
connectDB()

const authRoutes = require("./routes/authRoutes")
const businessRoutes = require("./routes/businessRoutes")
const productRoutes = require("./routes/productRoutes")
const customerRoutes = require("./routes/customerRoutes")
const invoiceRoutes = require("./routes/invoiceRoutes")
const purchaseRoutes = require("./routes/purchaseRoutes")
const expenseRoutes = require("./routes/expenseRoutes")
const incomeRoutes = require("./routes/incomeRoutes")
const reportRoutes = require("./routes/reportRoutes")
const receiptRoutes = require("./routes/receiptRoutes")
const salesReturnRoutes = require("./routes/salesReturnRoutes")
const purchaseReturnRoutes = require("./routes/purchaseReturnRoutes")
const paymentRoutes = require("./routes/payment")
const supplierRoutes = require("./routes/routes")
const ledgerRoutes = require("./routes/ledgerRoutes")
const capitalRoutes = require("./routes/capitalRouter")


const app = express()

app.use(cors({
    origin: ["http://localhost:5173", "https://bill-nest-frontend.vercel.app"],
    credentials: true
}))
app.use(express.json())

app.get("/", (req, res) => {
    res.send("BillNest API is Running...")
})

app.use("/api/auth", authRoutes)
app.use("/api/business", businessRoutes)
app.use("/api/products", productRoutes)
app.use("/api/customers", customerRoutes)
app.use("/api/invoices", invoiceRoutes)
app.use("/api/purchases", purchaseRoutes)
app.use("/api/expense", expenseRoutes)
app.use("/api/income", incomeRoutes)
app.use("/api/report", reportRoutes)
app.use("/api/receipts", receiptRoutes)
app.use("/api/salesReturn", salesReturnRoutes)
app.use("/api/purchaseReturn", purchaseReturnRoutes)
app.use("/api/payments", paymentRoutes)
app.use("/api/suppliers", supplierRoutes)
app.use("/api/ledger", ledgerRoutes)
app.use("/api/capital", capitalRoutes)



const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})

