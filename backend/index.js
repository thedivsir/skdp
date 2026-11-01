const express = require("express");
const cors    = require("cors");
const crypto  = require("crypto");
const Razorpay = require("razorpay");
require("dotenv").config();

const app  = express();
const PORT = process.env.PORT || 3001;

/* ─────────────────────────────────────────────────────────
   CORS — sirf apni website se requests allow karo
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

app.use(express.json({ limit: "10kb" })); // large payload attack se bachao

/* ─────────────────────────────────────────────────────────
   Simple Rate Limiter — bina kisi library ke
   Har IP se 30 requests/minute allow karo
───────────────────────────────────────────────────────── */
const rateMap = new Map();

function rateLimit(req, res, next) {
  const ip  = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket.remoteAddress || "unknown";
  const now = Date.now();
  const windowMs = 60_000; // 1 minute
  const maxRequests = 30;

  const entry = rateMap.get(ip) || { count: 0, start: now };

  if (now - entry.start > windowMs) {
    // Window reset
    rateMap.set(ip, { count: 1, start: now });
    return next();
  }

  entry.count++;
  rateMap.set(ip, entry);

  if (entry.count > maxRequests) {
    return res.status(429).json({ message: "बहुत अधिक अनुरोध। कृपया 1 मिनट बाद प्रयास करें।" });
  }

  next();
}

// Old entries clean karo memory leak se bachne ke liye
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateMap.entries()) {
    if (now - entry.start > 120_000) rateMap.delete(ip);
  }
}, 120_000);

/* ─────────────────────────────────────────────────────────
   Input Sanitization Helper
───────────────────────────────────────────────────────── */
function sanitizeString(value, maxLength = 200) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

function isValidMobile(mobile) {
  return /^[6-9]\d{9}$/.test(mobile);
}

function isValidEmail(email) {
  if (!email) return true; // optional field
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
}

function isValidDate(dateStr) {
  if (!dateStr) return false;
  const date = new Date(`${dateStr}T00:00:00`);
  return !isNaN(date.getTime());
}

/* ─────────────────────────────────────────────────────────
   Timing-safe Signature Verification
───────────────────────────────────────────────────────── */
function verifySignature(orderId, paymentId, receivedSignature) {
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  // Timing-safe comparison — prevents timing attacks
  try {
    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature, "hex"),
      Buffer.from(receivedSignature,  "hex")
    );
  } catch {
    return false;
  }
}

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
app.post("/api/membership/create-order", rateLimit, async (req, res) => {
  try {
    const name    = sanitizeString(req.body.name,    100);
    const mobile  = sanitizeString(req.body.mobile,   10);
    const email   = sanitizeString(req.body.email,   254);
    const address = sanitizeString(req.body.address, 500);
    const amount  = req.body.amount;

    // Validate
    if (!name || name.length < 2) {
      return res.status(400).json({ message: "कृपया सही नाम दर्ज करें।" });
    }

    if (!isValidMobile(mobile)) {
      return res.status(400).json({ message: "कृपया सही 10 अंकों का मोबाइल नंबर दर्ज करें।" });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "कृपया सही ईमेल दर्ज करें।" });
    }

    const membershipAmount = Number(amount);
    if (!Number.isInteger(membershipAmount) || membershipAmount < 100 || membershipAmount > 1_000_000) {
      return res.status(400).json({ message: "न्यूनतम सदस्यता शुल्क ₹100 है।" });
    }

    const order = await razorpay.orders.create({
      amount:   membershipAmount * 100,
      currency: "INR",
      receipt:  `mem_${Date.now()}`,
      notes:    { name, mobile, email, address },
    });

    return res.json({
      orderId:  order.id,
      keyId:    process.env.RAZORPAY_KEY_ID,
      amount:   order.amount,
      currency: order.currency,
    });
  } catch (err) {
    console.error("Membership create-order error:", err.message);
    return res.status(500).json({ message: "भुगतान ऑर्डर नहीं बनाया जा सका।" });
  }
});

// POST /api/membership/verify-payment
app.post("/api/membership/verify-payment", rateLimit, async (req, res) => {
  try {
    const orderId   = sanitizeString(req.body.orderId,   100);
    const paymentId = sanitizeString(req.body.paymentId, 100);
    const signature = sanitizeString(req.body.signature, 200);

    if (!orderId || !paymentId || !signature) {
      return res.status(400).json({ message: "भुगतान विवरण अधूरा है।" });
    }

    const isValid = verifySignature(orderId, paymentId, signature);

    if (!isValid) {
      return res.status(400).json({ message: "भुगतान हस्ताक्षर सही नहीं है।", verified: false });
    }

    return res.json({ verified: true, paymentId, orderId });
  } catch (err) {
    console.error("Membership verify-payment error:", err.message);
    return res.status(500).json({ message: "भुगतान सत्यापन में समस्या आई।" });
  }
});

/* ═══════════════════════════════════════════════════════
   TOUR TICKET ROUTES
═══════════════════════════════════════════════════════ */

const TICKET_PRICE = 20; // ₹20 per visitor

// POST /api/tourism/create-order
app.post("/api/tourism/create-order", rateLimit, async (req, res) => {
  try {
    const visitDate   = sanitizeString(req.body.visitDate,   10);
    const contactName = sanitizeString(req.body.contactName, 100);
    const mobile      = sanitizeString(req.body.mobile,       10);
    const email       = sanitizeString(req.body.email,       254);
    const visitorCount = req.body.visitorCount;

    if (!contactName || contactName.length < 2) {
      return res.status(400).json({ message: "कृपया सही नाम दर्ज करें।" });
    }

    if (!isValidMobile(mobile)) {
      return res.status(400).json({ message: "कृपया सही 10 अंकों का मोबाइल नंबर दर्ज करें।" });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "कृपया सही ईमेल दर्ज करें।" });
    }

    if (!isValidDate(visitDate)) {
      return res.status(400).json({ message: "कृपया सही भ्रमण दिनांक दर्ज करें।" });
    }

    const count = Number(visitorCount);
    if (!Number.isInteger(count) || count < 1 || count > 20) {
      return res.status(400).json({ message: "आगंतुक संख्या 1 से 20 के बीच होनी चाहिए।" });
    }

    // Server-side price calculation — client pe trust nahi karte
    const totalAmount = count * TICKET_PRICE;
    const bookingId   = `BKG_${Date.now()}_${crypto.randomBytes(3).toString("hex").toUpperCase()}`;

    const order = await razorpay.orders.create({
      amount:   totalAmount * 100,
      currency: "INR",
      receipt:  bookingId,
      notes:    { contactName, mobile, email, visitDate, visitorCount: String(count) },
    });

    return res.json({
      orderId:   order.id,
      keyId:     process.env.RAZORPAY_KEY_ID,
      bookingId,
      amount:    order.amount,
      currency:  order.currency,
    });
  } catch (err) {
    console.error("Tourism create-order error:", err.message);
    return res.status(500).json({ message: "बुकिंग ऑर्डर नहीं बनाया जा सका।" });
  }
});

// POST /api/tourism/verify-payment
app.post("/api/tourism/verify-payment", rateLimit, async (req, res) => {
  try {
    const bookingId        = sanitizeString(req.body.bookingId,            100);
    const razorpay_order_id  = sanitizeString(req.body.razorpay_order_id,  100);
    const razorpay_payment_id = sanitizeString(req.body.razorpay_payment_id, 100);
    const razorpay_signature  = sanitizeString(req.body.razorpay_signature,  200);

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: "भुगतान विवरण अधूरा है।" });
    }

    const isValid = verifySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);

    if (!isValid) {
      return res.status(400).json({ message: "भुगतान हस्ताक्षर सही नहीं है।", verified: false });
    }

    const year         = new Date().getFullYear();
    const seq          = String(Math.floor(Math.random() * 900000) + 100000);
    const ticketNumber = `SKDM-${year}-${seq}`;

    return res.json({
      verified:     true,
      ticketNumber,
      bookingId:    bookingId || razorpay_order_id,
      paymentId:    razorpay_payment_id,
    });
  } catch (err) {
    console.error("Tourism verify-payment error:", err.message);
    return res.status(500).json({ message: "भुगतान सत्यापन में समस्या आई।" });
  }
});

/* ─────────────────────────────────────────────────────────
   404 handler
───────────────────────────────────────────────────────── */
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

/* ─────────────────────────────────────────────────────────
   Start server
───────────────────────────────────────────────────────── */
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
