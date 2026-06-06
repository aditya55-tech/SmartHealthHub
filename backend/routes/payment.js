const express = require("express");
const router = express.Router();
const Razorpay = require("razorpay");
const crypto = require("crypto");
const { protect } = require("../middleware/authMiddleware");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// CREATE RAZORPAY ORDER
router.post("/create-order", protect, async (req, res) => {
  try {
    const { amount } = req.body; // amount in paise (INR * 100)

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    const options = {
      amount: Math.round(amount), // paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    return res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("Razorpay create order error:", error);
    return res.status(500).json({ message: "Failed to create payment order" });
  }
});

// VERIFY RAZORPAY PAYMENT
router.post("/verify", protect, async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Invalid payment signature" });
    }

    return res.json({ success: true, paymentId: razorpay_payment_id });
  } catch (error) {
    console.error("Razorpay verify error:", error);
    return res.status(500).json({ message: "Payment verification failed" });
  }
});

module.exports = router;
