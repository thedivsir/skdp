"use strict";

const express  = require("express");
const cors     = require("cors");
const crypto   = require("crypto");
const helmet   = require("helmet");
const Razorpay = require("razorpay");
require("dotenv").config();

/* ─────────────────────────────────────────────────────────
   STARTUP GUARD — crash fast if credentials are missing
───────────────────────────────────────────────────────── */
if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.error("FATAL: RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET is not set. Exiting.");
  process.exit(1);
}

const app  = express();
const PORT = process.env.PORT || 3001;

/* ─────────────────────────────────────────────────────────
   Security headers via helmet
───────────────────────────────────────────────────────── */
app.use(helmet({
  contentSecurityPolicy: false, // CSP set in Firebase hosting headers
}));

/* ─────────────────────────────────────────────────────────
   CORS — sirf apni website se requests allow karo
───────────────────────────────────────────────────────── */
const allowedOrigins = [
  "https://shree-kailash-dham.web.app",
  "https://shree-kailash-dham.firebaseapp.com",
  "http://localhost:5173",
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (server-to-server, Render health checks)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("CORS not allowed"), false);
  },
  methods: ["GET", "POST"],
  credentials: true,
}));

// JSON body limit — large payload attack se bachao
app.use(express.json({ limit: "10kb" }));

/* ─────────────────────────────────────────────────────────
   In-process Rate Limiter
   Har IP se max 20 payment requests per minute
───────────────────────────────────────────────────────── */
const rateMap = new Map();
const RATE_WINDOW_MS  = 60_000;
const RATE_MAX        = 20;
const RATE_CLEANUP_MS = 120_000;

function rateLimit(req, res, next) {
  // Render sets x-forwarded-for; take rightmost value to prevent spoofing
  const forwarded = req.headers["x-forwarded-for"];
  const ip = forwarded
    ? forwarded.split(",").pop().trim()
    : req.socket.remoteAddress || "unknown";

  const now   = Date.now();
  const entry = rateMap.get(ip) || { count: 0, start: now };

  if (now - entry.start > RATE_WINDOW_MS) {
    rateMap.set(ip, { count: 1, start: now });
    return next();
  }

  entry.count += 1;
  rateMap.set(ip, entry);

  if (entry.count > RATE_MAX) {
    return res.status(429).json({
      message: "बहुत अधिक अनुरोध। कृपया 1 मिनट बाद प्रयास करें।",
    });
  }

  return next();
}

// Cleanup stale entries every 2 minutes
setInterval(() => {
  const cutoff = Date.now() - RATE_CLEANUP_MS;
  for (const [ip, entry] of rateMap.entries()) {
    if (entry.start < cutoff) rateMap.delete(ip);
  }
}, RATE_CLEANUP_MS);

/* ─────────────────────────────────────────────────────────
   Input helpers
───────────────────────────────────────────────────────── */
function sanitizeString(value, maxLength = 200) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

function isValidMobile(mobile) {
  return /^[6-9]\d{9}$/.test(mobile);
}

// Returns true if email is empty (optional field) or a valid address
function isEmailValidOrEmpty(email) {
  if (!email) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
}

function isFutureDateOrToday(dateStr) {
  if (!dateStr) return false;
  const date = new Date(`${dateStr}T00:00:00`);
  if (isNaN(date.getTime())) return false;
  // Compare date only (no time) in IST — strip time component
  const todayIST = new Date(
    new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" })
  );
  return date >= todayIST;
}

/* ─────────────────────────────────────────────────────────
   Timing-safe signature verification
───────────────────────────────────────────────────────── */
function verifyRazorpaySignature(orderId, paymentId, receivedSig) {
  try {
    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    // Pad to same length before timingSafeEqual to avoid length-mismatch crash
    const a = Buffer.alloc(32);
    const b = Buffer.alloc(32);
    Buffer.from(expected,     "hex").copy(a);
    Buffer.from(receivedSig,  "hex").copy(b);
    return crypto.timingSafeEqual(a, b);
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
   Crypto-safe unique ticket number
───────────────────────────────────────────────────────── */
function generateTicketNumber() {
  const year = new Date().getFullYear();
  // 6 random bytes → 12 hex chars — astronomically low collision probability
  const unique = crypto.randomBytes(6).toString("hex").toUpperCase();
  return `SKDM-${year}-${unique}`;
}

/* ─────────────────────────────────────────────────────────
   Health check
───────────────────────────────────────────────────────── */
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Shree Kailash Dhaam — Payment Server" });
});

/* ═══════════════════════════════════════════════════════
   MEMBERSHIP ROUTES
═══════════════════════════════════════════════════════ */

app.post("/api/membership/create-order", rateLimit, async (req, res) => {
  try {
    const name    = sanitizeString(req.body.name,    100);
    const mobile  = sanitizeString(req.body.mobile,   10);
    const email   = sanitizeString(req.body.email,   254);
    const address = sanitizeString(req.body.address, 500);
    const amount  = req.body.amount;

    if (!name || name.length < 2) {
      return res.status(400).json({ message: "कृपया सही नाम दर्ज करें।" });
    }
    if (!isValidMobile(mobile)) {
      return res.status(400).json({ message: "कृपया 10 अंकों का सही मोबाइल नंबर दर्ज करें।" });
    }
    if (!isEmailValidOrEmpty(email)) {
      return res.status(400).json({ message: "कृपया सही ईमेल पता दर्ज करें।" });
    }
    if (!address) {
      return res.status(400).json({ message: "कृपया पता दर्ज करें।" });
    }

    const membershipAmount = Number(amount);
    if (
      !Number.isInteger(membershipAmount) ||
      membershipAmount < 100 ||
      membershipAmount > 100_000
    ) {
      return res.status(400).json({ message: "सदस्यता शुल्क ₹100 से ₹1,00,000 के बीच होना चाहिए।" });
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
    console.error("[membership/create-order]", err.message);
    return res.status(500).json({ message: "भुगतान ऑर्डर नहीं बनाया जा सका।" });
  }
});

app.post("/api/membership/verify-payment", rateLimit, async (req, res) => {
  try {
    const orderId   = sanitizeString(req.body.orderId,   100);
    const paymentId = sanitizeString(req.body.paymentId, 100);
    const signature = sanitizeString(req.body.signature, 200);

    if (!orderId || !paymentId || !signature) {
      return res.status(400).json({ message: "भुगतान विवरण अधूरा है।" });
    }

    if (!verifyRazorpaySignature(orderId, paymentId, signature)) {
      return res.status(400).json({ message: "भुगतान सत्यापन असफल।", verified: false });
    }

    return res.json({ verified: true, paymentId, orderId });
  } catch (err) {
    console.error("[membership/verify-payment]", err.message);
    return res.status(500).json({ message: "भुगतान सत्यापन में समस्या आई।" });
  }
});

/* ═══════════════════════════════════════════════════════
   TOUR TICKET ROUTES
═══════════════════════════════════════════════════════ */

const TICKET_PRICE = 20;

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
      return res.status(400).json({ message: "कृपया 10 अंकों का सही मोबाइल नंबर दर्ज करें।" });
    }
    if (!isEmailValidOrEmpty(email)) {
      return res.status(400).json({ message: "कृपया सही ईमेल पता दर्ज करें।" });
    }
    if (!isFutureDateOrToday(visitDate)) {
      return res.status(400).json({ message: "कृपया आज या भविष्य की भ्रमण तारीख चुनें।" });
    }

    const count = Number(visitorCount);
    if (!Number.isInteger(count) || count < 1 || count > 20) {
      return res.status(400).json({ message: "आगंतुक संख्या 1 से 20 के बीच होनी चाहिए।" });
    }

    const totalAmount = count * TICKET_PRICE;
    const bookingId   = `BKG_${Date.now()}_${crypto.randomBytes(4).toString("hex").toUpperCase()}`;

    const order = await razorpay.orders.create({
      amount:   totalAmount * 100,
      currency: "INR",
      receipt:  bookingId.slice(0, 40), // Razorpay receipt max 40 chars
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
    console.error("[tourism/create-order]", err.message);
    return res.status(500).json({ message: "बुकिंग ऑर्डर नहीं बनाया जा सका।" });
  }
});

app.post("/api/tourism/verify-payment", rateLimit, async (req, res) => {
  try {
    const bookingId          = sanitizeString(req.body.bookingId,             100);
    const razorpay_order_id  = sanitizeString(req.body.razorpay_order_id,     100);
    const razorpay_payment_id = sanitizeString(req.body.razorpay_payment_id,  100);
    const razorpay_signature  = sanitizeString(req.body.razorpay_signature,   200);

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: "भुगतान विवरण अधूरा है।" });
    }

    if (!verifyRazorpaySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature)) {
      return res.status(400).json({ message: "भुगतान सत्यापन असफल।", verified: false });
    }

    return res.json({
      verified:     true,
      ticketNumber: generateTicketNumber(),
      bookingId:    bookingId || razorpay_order_id,
      paymentId:    razorpay_payment_id,
    });
  } catch (err) {
    console.error("[tourism/verify-payment]", err.message);
    return res.status(500).json({ message: "भुगतान सत्यापन में समस्या आई।" });
  }
});

/* ─────────────────────────────────────────────────────────
   404 + Global error handler
───────────────────────────────────────────────────────── */
app.use((req, res) => {
  res.status(404).json({ message: "Not found" });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error("[unhandled]", err.message);
  res.status(500).json({ message: "Internal server error" });
});

/* ─────────────────────────────────────────────────────────
   Start
───────────────────────────────────────────────────────── */
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
