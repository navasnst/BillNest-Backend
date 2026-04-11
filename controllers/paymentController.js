// const Payment = require("../models/Payment");
// const Ledger = require("../models/Ledger");

// exports.createPayment = async (req, res) => {
//   try {
//     const { businessId, supplier, amount, paymentMode, note } = req.body;

//     const payment = await Payment.create({
//       business: businessId,
//       supplier,
//       amount,
//       paymentMode,
//       note,
//     });

//     await Ledger.create({
//       business: businessId,
//       type: paymentMode === "Cash" ? "Cash" : "Bank",
//       amount,
//       transactionType: "OUT",
//       source: "Payment",
//       referenceId: payment._id,
//       note: "Supplier payment",
//     });

//     res.status(201).json(payment);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// exports.getPayments = async (req, res) => {
//   try {
//     const { businessId } = req.params;

//     const payments = await Payment.find({ business: businessId })
//       .populate("supplier")
//       .sort({ createdAt: -1 });

//     res.json(payments);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// exports.deletePayment = async (req, res) => {
//   try {
//     const { id } = req.params;

//     await Payment.findByIdAndDelete(id);

//     res.json({ message: "Payment deleted" });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };





const Payment = require("../models/Payment");
const Ledger = require("../models/Ledger");

// ✅ CREATE PAYMENT (PAY SUPPLIER)
exports.createPayment = async (req, res) => {
  try {
    const { businessId, supplier, amount, paymentMode, note } = req.body;

    // ✅ VALIDATION
    if (!businessId || !supplier || !amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid payment data" });
    }

    // ✅ CREATE PAYMENT
    const payment = await Payment.create({
      business: businessId,
      supplier,
      amount,
      paymentMode,
      note,
    });

    // ✅ LEDGER ENTRY (FIXED SOURCE)
    await Ledger.create({
      business: businessId,
      type: paymentMode === "Cash" ? "Cash" : "Bank",
      amount,
      transactionType: "OUT",
      source: "payment", // ✅ FIXED
      referenceId: payment._id,
      note: "Supplier payment",
    });

    res.status(201).json(payment);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ GET PAYMENTS
exports.getPayments = async (req, res) => {
  try {
    const { businessId } = req.params;

    const payments = await Payment.find({ business: businessId })
      .populate("supplier")
      .sort({ createdAt: -1 });

    res.json(payments);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ DELETE PAYMENT (OPTIONAL: also remove ledger later)
exports.deletePayment = async (req, res) => {
  try {
    const { id } = req.params;

    await Payment.findByIdAndDelete(id);

    res.json({ message: "Payment deleted" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};