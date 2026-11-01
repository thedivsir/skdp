const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
const Razorpay = require("razorpay");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3001;

/* ─────────────────────────────────────────────────────────
   Middleware
───────────────────────────────────────────────────────── */
app.use(cors({
  origin: [
    "https://shree-kailash-dham.web.app",
    "https://shree-kailash-dham.firebaseapp.com",
    "http://localhost:5173",
  ],
  methods: ["GET", "POST"],
  credentials: true,
}));

app.use(express.json());

/* ─────────────────────────────────────────────────────────
   Razorpay instance
───────────────────────────────────────────────────────── */
const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/* ─────────────────────────────────────────────────────────
   Health check
───────────────────────────────────────────────────────── */
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Shree Kailash Dhaam — Payment Server" });
});

/* ═══════════════════════════════════════════════════════
   MEMBERSHIP ROUTES
═══════════════════════════════════════════════════════ */

// POST /api/membership/create-order
app.post("/api/membership/create-order", async (req, res) => {
  try {
    const { name, mobile, email, address, amount } = req.body;

    // Validate
    if (!name || !mobile || !amount) {
      return res.status(400).json({ message: "नाम, मोबाइल और राशि आवश्यक हैं।" });
    }

    const membershipAmount = Number(amount);
    if (!Number.isInteger(membershipAmount) || membershipAmount < 100) {
      return res.status(400).json({ message: "न्यूनतम सदस्यता शुल्क ₹100 है।" });
    }

    const order = await razorpay.orders.create({
      amount:   membershipAmount * 100, // paise mein
      currency: "INR",
      receipt:  `mem_${Date.now()}`,
      notes: { name, mobile, email: email || "", address: address || "" },
    });

    return res.json({
      orderId:  order.id,
      keyId:    process.env.RAZORPAY_KEY_ID,
      amount:   order.amount,
      currency: order.currency,
    });
  } catch (err) {
    console.error("Membership create-order error:", err);
    return res.status(500).json({ message: "भुगतान ऑर्डर नहीं बनाया जा सका।" });
  }
});

// POST /api/membership/verify-payment
app.post("/api/membership/verify-payment", async (req, res) => {
  try {
    const { orderId, paymentId, signature } = req.body;

    if (!orderId || !paymentId || !signature) {
      return res.status(400).json({ message: "भुगतान विवरण अधूरा है।" });
    }

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    if (expectedSignature !== signature) {
      return res.status(400).json({ message: "भुगतान हस्ताक्षर सही नहीं है।", verified: false });
    }

    return res.json({ verified: true, paymentId, orderId });
  } catch (err) {
    console.error("Membership verify-payment error:", err);
    return res.status(500).json({ message: "भुगतान सत्यापन में समस्या आई।" });
  }
});

/* ═══════════════════════════════════════════════════════
   TOUR TICKET ROUTES
═══════════════════════════════════════════════════════ */

const TICKET_PRICE = 20; // ₹20 per visitor

// POST /api/tourism/create-order
app.post("/api/tourism/create-order", async (req, res) => {
  try {
    const { visitDate, visitorCount, contactName, mobile, email } = req.body;

    if (!visitDate || !visitorCount || !contactName || !mobile) {
      return res.status(400).json({ message: "सभी आवश्यक जानकारी भरें।" });
    }

    const count = Number(visitorCount);
    if (!Number.isInteger(count) || count < 1 || count > 20) {
      return res.status(400).json({ message: "आगंतुक संख्या 1 से 20 के बीच होनी चाहिए।" });
    }

    const totalAmount = count * TICKET_PRICE;
    const bookingId   = `BKG_${Date.now()}_${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

    const order = await razorpay.orders.create({
      amount:   totalAmount * 100,
      currency: "INR",
      receipt:  bookingId,
      notes: { contactName, mobile, email: email || "", visitDate, visitorCount: String(count) },
    });

    return res.json({
      orderId:   order.id,
      keyId:     process.env.RAZORPAY_KEY_ID,
      bookingId,
      amount:    order.amount,
      currency:  order.currency,
    });
  } catch (err) {
    console.error("Tourism create-order error:", err);
    return res.status(500).json({ message: "बुकिंग ऑर्डर नहीं बनाया जा सका।" });
  }
});

// POST /api/tourism/verify-payment
app.post("/api/tourism/verify-payment", async (req, res) => {
  try {
    const {
      bookingId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: "भुगतान विवरण अधूरा है।" });
    }

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "भुगतान हस्ताक्षर सही नहीं है।", verified: false });
    }

    // Generate ticket number
    const year     = new Date().getFullYear();
    const seq      = String(Math.floor(Math.random() * 900000) + 100000);
    const ticketNumber = `SKDM-${year}-${seq}`;

    return res.json({
      verified:     true,
      ticketNumber,
      bookingId:    bookingId || razorpay_order_id,
      paymentId:    razorpay_payment_id,
    });
  } catch (err) {
    console.error("Tourism verify-payment error:", err);
    return res.status(500).json({ message: "भुगतान सत्यापन में समस्या आई।" });
  }
});

/* ─────────────────────────────────────────────────────────
   Start server
───────────────────────────────────────────────────────── */
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
