import { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Download,
  Info,
  LoaderCircle,
  MapPin,
  PartyPopper,
  Ticket,
  Users,
  X,
} from "lucide-react";
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  runTransaction,
  getDoc,
} from "firebase/firestore";
import { db } from "../config/firebase";
import TourTicketReceipt from "../components/tourTicket/TourTicketReceipt";
import generateTourTicketPDF from "../utils/generateTourTicketPDF";

/* ─────────────────────────────────────────────────────────
   Constants
───────────────────────────────────────────────────────── */

const TICKET_PRICE = 20;
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

const initialForm = {
  date: "",
  visitors: "1",
  name: "",
  mobile: "",
  email: "",
};

const fieldClass =
  "w-full rounded-xl border border-[#e6dccd] bg-white px-4 py-3 text-sm outline-none focus:border-[#8a2630] focus:ring-2 focus:ring-[#8a2630]/10";

/* ─────────────────────────────────────────────────────────
   Helpers
───────────────────────────────────────────────────────── */

function getTodayLocalDate() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

function formatDate(dateString) {
  if (!dateString) return "—";
  return new Date(`${dateString}T00:00:00`).toLocaleDateString("hi-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function loadRazorpay() {
  return new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return; }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

/* ─────────────────────────────────────────────────────────
   Generate sequential ticket number from Firestore counter
   Format: SKDM-2026-0000001, SKDM-2026-0000002 ...
───────────────────────────────────────────────────────── */

async function generateTicketNumber() {
  const year = new Date().getFullYear();
  const counterRef = doc(db, "counters", `tour_tickets_${year}`);

  const newSeq = await runTransaction(db, async (transaction) => {
    const counterSnap = await transaction.get(counterRef);
    const current = counterSnap.exists() ? (counterSnap.data().seq || 0) : 0;
    const next = current + 1;
    transaction.set(counterRef, { seq: next, year });
    return next;
  });

  const padded = String(newSeq).padStart(7, "0");
  return `SKDM-${year}-${padded}`;
}

/* ─────────────────────────────────────────────────────────
   Save booking to Firestore
───────────────────────────────────────────────────────── */

async function saveBookingToFirestore(data) {
  await addDoc(collection(db, "tour_bookings"), {
    ticketNumber: data.ticketNumber,
    contactName: data.contactName,
    mobile: data.mobile,
    email: data.email || null,
    visitDate: data.visitDate,
    visitorCount: data.visitorCount,
    amount: data.amount,
    paymentId: data.paymentId || null,
    paymentStatus: data.paymentStatus || "pending",
    status: data.status || "confirmed",
    issuedAt: serverTimestamp(),
  });
}

/* ─────────────────────────────────────────────────────────
   Component
───────────────────────────────────────────────────────── */

export default function TourTicket() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [booking, setBooking] = useState(null);
  const [paymentState, setPaymentState] = useState("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  const receiptRef = useRef(null);

  const visitorCount = Number(form.visitors);
  const totalAmount = visitorCount * TICKET_PRICE;
  const minDate = useMemo(() => getTodayLocalDate(), []);

  /* ── Field updater ── */
  const update = (field, value) => {
    setForm((old) => ({ ...old, [field]: value }));
    setErrors((old) => ({ ...old, [field]: "" }));
    if (paymentState !== "success") {
      setStatusMessage("");
      setPaymentState("idle");
    }
  };

  /* ── Validation ── */
  const validate = () => {
    const next = {};
    if (!form.date) {
      next.date = "कृपया भ्रमण की तारीख चुनें।";
    } else if (form.date < minDate) {
      next.date = "कृपया आज या उसके बाद की तारीख चुनें।";
    }
    if (!form.name.trim()) {
      next.name = "कृपया अपना नाम दर्ज करें।";
    }
    if (!/^[6-9]\d{9}$/.test(form.mobile)) {
      next.mobile = "कृपया 10 अंकों का सही मोबाइल नंबर दर्ज करें।";
    }
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      next.email = "कृपया सही ईमेल पता दर्ज करें।";
    }
    if (!Number.isInteger(visitorCount) || visitorCount < 1 || visitorCount > 20) {
      next.visitors = "कृपया 1 से 20 तक आगंतुकों की संख्या चुनें।";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  /* ── Confirm booking: save to Firestore + show popup ── */
  const confirmBooking = async (bookingData) => {
    try {
      await saveBookingToFirestore(bookingData);
    } catch {
      // Firestore save failure should not block the user from getting their ticket
    }
    setBooking(bookingData);
    setPaymentState("success");
    setShowSuccessPopup(true);
    setStatusMessage("भुगतान सफल और टिकट की पुष्टि हो गई है। नीचे से टिकट डाउनलोड करें।");
  };

  /* ── Begin payment ── */
  const beginPayment = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    setPaymentState("creating-order");
    setStatusMessage("बुकिंग विवरण सुरक्षित किए जा रहे हैं…");

    /* ── No backend: save directly to Firestore ── */
    if (!API_BASE_URL) {
      const ticketNumber = await generateTicketNumber();
      const bookingData = {
        ticketNumber,
        contactName: form.name.trim(),
        mobile: form.mobile,
        email: form.email.trim() || "",
        visitDate: form.date,
        visitorCount,
        amount: totalAmount,
        paymentId: null,
        paymentStatus: "pending_payment",
        status: "confirmed",
        issuedAt: new Date().toISOString(),
      };
      await confirmBooking(bookingData);
      return;
    }

    /* ── With backend: Razorpay flow ── */
    try {
      const orderResponse = await fetch(`${API_BASE_URL}/api/tourism/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visitDate: form.date,
          visitorCount,
          contactName: form.name.trim(),
          mobile: form.mobile,
          email: form.email.trim() || undefined,
        }),
      });

      const orderData = await orderResponse.json().catch(() => ({}));
      if (!orderResponse.ok) {
        throw new Error(orderData.message || "बुकिंग ऑर्डर नहीं बनाया जा सका।");
      }
      if (!orderData.orderId || !orderData.keyId || !orderData.bookingId) {
        throw new Error("सर्वर से भुगतान ऑर्डर का सही विवरण नहीं मिला।");
      }

      const loaded = await loadRazorpay();
      if (!loaded) {
        throw new Error("Razorpay भुगतान विंडो लोड नहीं हो सकी। कृपया पुनः प्रयास करें।");
      }

      setPaymentState("payment-open");
      setStatusMessage("भुगतान विंडो खुल रही है…");

      const razorpay = new window.Razorpay({
        key: orderData.keyId,
        order_id: orderData.orderId,
        amount: orderData.amount ?? totalAmount * 100,
        currency: orderData.currency || "INR",
        name: "Shree Kailash Dhaam Mandir",
        description: `मंदिर भ्रमण टिकट — ${visitorCount} आगंतुक`,
        prefill: {
          name: form.name.trim(),
          contact: form.mobile,
          email: form.email.trim(),
        },
        notes: {
          bookingId: orderData.bookingId,
          visitDate: form.date,
          visitorCount: String(visitorCount),
        },
        theme: { color: "#7b1b26" },
        modal: {
          ondismiss: () => {
            setPaymentState("idle");
            setStatusMessage("भुगतान पूरा नहीं हुआ। आप चाहें तो पुनः प्रयास कर सकते हैं।");
          },
        },
        handler: async (response) => {
          setPaymentState("verifying");
          setStatusMessage("भुगतान की पुष्टि की जा रही है…");

          try {
            const verifyResponse = await fetch(`${API_BASE_URL}/api/tourism/verify-payment`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                bookingId: orderData.bookingId,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyResponse.json().catch(() => ({}));
            if (!verifyResponse.ok || verifyData.verified !== true || !verifyData.ticketNumber) {
              throw new Error(
                verifyData.message ||
                  "भुगतान की पुष्टि अभी नहीं हो सकी। कृपया भुगतान संदर्भ के साथ मंदिर प्रशासन से संपर्क करें।"
              );
            }

            const bookingData = {
              ticketNumber: verifyData.ticketNumber,
              contactName: verifyData.contactName || form.name.trim(),
              mobile: verifyData.mobile || form.mobile,
              email: verifyData.email ?? form.email.trim(),
              visitDate: verifyData.visitDate || form.date,
              visitorCount: Number(verifyData.visitorCount ?? visitorCount),
              amount: Number(verifyData.amount ?? totalAmount),
              paymentId: verifyData.paymentId || response.razorpay_payment_id,
              paymentStatus: "सफल",
              status: "confirmed",
              issuedAt: new Date().toISOString(),
            };

            await confirmBooking(bookingData);
          } catch (error) {
            setPaymentState("verification-error");
            setStatusMessage(
              error.message ||
                "भुगतान की पुष्टि नहीं हो सकी। दोबारा भुगतान करने से पहले कृपया प्रशासन से संपर्क करें।"
            );
          }
        },
      });

      razorpay.on("payment.failed", (response) => {
        setPaymentState("idle");
        setStatusMessage(
          response?.error?.description || "भुगतान असफल रहा। कृपया पुनः प्रयास करें।"
        );
      });

      razorpay.open();
    } catch (error) {
      setPaymentState("error");
      setStatusMessage(
        error.message || "बुकिंग शुरू नहीं हो सकी। कृपया सर्वर कनेक्शन जाँचकर पुनः प्रयास करें।"
      );
    }
  };

  /* ── Download PDF ── */
  const downloadTicket = async () => {
    if (!booking || paymentState !== "success" || !receiptRef.current) return;
    setIsDownloading(true);
    try {
      await generateTourTicketPDF(receiptRef.current, booking.ticketNumber);
    } catch (error) {
      setStatusMessage(error.message || "टिकट PDF तैयार नहीं हो सकी। कृपया पुनः प्रयास करें।");
    } finally {
      setIsDownloading(false);
    }
  };

  const isBusy = ["creating-order", "payment-open", "verifying"].includes(paymentState);

  /* ─────────────────────────────────────────────────────
     RENDER
  ───────────────────────────────────────────────────── */

  return (
    <main className="min-h-screen bg-[#fbf7ef] text-[#43231f]">

      {/* ══════════════════════════════════════════════
          SUCCESS POPUP MODAL
      ══════════════════════════════════════════════ */}
      {showSuccessPopup && booking && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="ticket-success-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm"
        >
          <div className="relative w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
            {/* Close button */}
            <button
              onClick={() => setShowSuccessPopup(false)}
              aria-label="बंद करें"
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-[#f6ecd9] text-[#8c5b25] transition hover:bg-[#ecd9b8]"
            >
              <X size={18} />
            </button>

            {/* Icon */}
            <div className="flex justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#fff4dd] text-[#e8a020]">
                <PartyPopper size={40} />
              </div>
            </div>

            {/* Text */}
            <div className="mt-5 text-center">
              <h2
                id="ticket-success-title"
                className="text-2xl font-bold text-[#2d6a2d]"
              >
                बुकिंग सफल रही!
              </h2>

              <p className="mt-3 text-base font-semibold text-[#43231f]">
                नमस्ते, <span className="text-[#7b1b26]">{booking.contactName}</span> जी 🙏
              </p>

              <p className="mt-2 text-sm leading-7 text-[#806f62]">
                आपकी मंदिर भ्रमण बुकिंग सफलतापूर्वक दर्ज हो गई है।
                भ्रमण के दिन यह टिकट अवश्य साथ लाएँ।
              </p>

              {/* Ticket number badge */}
              <div className="mt-4 rounded-xl border border-[#dfc58f] bg-[#fff8e8] px-5 py-3">
                <p className="text-xs font-semibold text-[#806f62]">टिकट संख्या</p>
                <p className="mt-1 font-bold text-[#7b1b26]">{booking.ticketNumber}</p>
              </div>

              {/* Visit details */}
              <div className="mt-3 flex items-center justify-center gap-5 text-sm">
                <div className="text-center">
                  <p className="text-xs text-[#968475]">भ्रमण दिनांक</p>
                  <p className="font-bold">{formatDate(booking.visitDate)}</p>
                </div>
                <div className="h-8 w-px bg-[#e6dccd]" />
                <div className="text-center">
                  <p className="text-xs text-[#968475]">आगंतुक</p>
                  <p className="font-bold">{booking.visitorCount}</p>
                </div>
                <div className="h-8 w-px bg-[#e6dccd]" />
                <div className="text-center">
                  <p className="text-xs text-[#968475]">कुल शुल्क</p>
                  <p className="font-bold text-[#7b1b26]">₹{booking.amount}</p>
                </div>
              </div>
            </div>

            {/* Download button */}
            <button
              onClick={async () => {
                setShowSuccessPopup(false);
                await downloadTicket();
              }}
              disabled={isDownloading}
              className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-[#7b1b26] py-3 font-bold text-white transition hover:bg-[#5f111c] disabled:opacity-70"
            >
              {isDownloading ? (
                <LoaderCircle size={18} className="animate-spin" />
              ) : (
                <Download size={18} />
              )}
              {isDownloading ? "टिकट तैयार हो रहा है…" : "टिकट PDF डाउनलोड करें"}
            </button>

            <button
              onClick={() => setShowSuccessPopup(false)}
              className="mt-3 w-full rounded-xl border border-[#e8ddca] py-2.5 text-sm font-semibold text-[#806f62] transition hover:bg-[#fbf7ef]"
            >
              बाद में डाउनलोड करें
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════ */}
      <section className="bg-[#4b111d]">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
          <Link
            to="/tourism"
            className="inline-flex items-center gap-2 text-sm text-[#e8c77f] hover:text-white"
          >
            <ArrowLeft size={17} />
            पर्यटन पृष्ठ पर वापस जाएँ
          </Link>

          <p className="mt-6 text-sm font-semibold text-[#e8c77f]">मंदिर पर्यटन</p>
          <h1 className="mt-2 text-3xl font-bold text-[#fff5e4] sm:text-4xl">
            मंदिर भ्रमण टिकट
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-[#f2dfce] sm:text-base">
            भूमि तल और चारों ऊपरी तल के भ्रमण के लिए एक ही टूर टिकट।
            टिकट शुल्क ₹20 प्रति व्यक्ति है।
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          BOOKING FORM + SIDEBAR
      ══════════════════════════════════════════════ */}
      <section className="mx-auto grid max-w-7xl items-start gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:px-8">
        <form
          onSubmit={beginPayment}
          noValidate
          className="space-y-6 rounded-2xl border border-[#e8ddca] bg-white p-5 sm:p-7"
        >
          <div className="flex items-center gap-3">
            <Ticket size={25} className="text-[#9a642a]" />
            <div>
              <h2 className="text-xl font-bold">टिकट बुकिंग विवरण</h2>
              <p className="mt-1 text-sm text-[#806f62]">
                जानकारी भरें और सुरक्षित भुगतान करें।
              </p>
            </div>
          </div>

          {/* Status message */}
          {statusMessage && (
            <div
              role="status"
              aria-live="polite"
              className={`rounded-xl border p-4 text-sm leading-7 ${
                paymentState === "success"
                  ? "border-green-200 bg-green-50 text-green-900"
                  : paymentState === "error" || paymentState === "verification-error"
                  ? "border-red-200 bg-red-50 text-red-800"
                  : "border-[#dfc58f] bg-[#fff8e8] text-[#67431f]"
              }`}
            >
              {paymentState === "success" ? (
                <CheckCircle2 size={20} className="mb-2 inline" />
              ) : isBusy ? (
                <LoaderCircle size={18} className="mr-2 inline animate-spin" />
              ) : (
                <Info size={18} className="mr-2 inline" />
              )}{" "}
              {statusMessage}
            </div>
          )}

          {/* Date */}
          <div>
            <label htmlFor="tour-date" className="mb-2 block text-sm font-semibold">
              भ्रमण की पसंदीदा तारीख <span className="text-red-600">*</span>
            </label>
            <div className="relative">
              <CalendarDays
                size={17}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#968475]"
              />
              <input
                id="tour-date"
                type="date"
                min={minDate}
                required
                value={form.date}
                disabled={isBusy || paymentState === "success"}
                onChange={(e) => update("date", e.target.value)}
                className={`${fieldClass} pl-10 disabled:bg-gray-100`}
              />
            </div>
            {errors.date && <p className="mt-1 text-xs text-red-700">{errors.date}</p>}
          </div>

          {/* Visitors */}
          <div>
            <label htmlFor="tour-visitors" className="mb-2 block text-sm font-semibold">
              कुल आगंतुक <span className="text-red-600">*</span>
            </label>
            <div className="relative">
              <Users
                size={17}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#968475]"
              />
              <select
                id="tour-visitors"
                value={form.visitors}
                disabled={isBusy || paymentState === "success"}
                onChange={(e) => update("visitors", e.target.value)}
                className={`${fieldClass} pl-10 disabled:bg-gray-100`}
              >
                {Array.from({ length: 20 }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>
                    {n} आगंतुक
                  </option>
                ))}
              </select>
            </div>
            {errors.visitors && (
              <p className="mt-1 text-xs text-red-700">{errors.visitors}</p>
            )}
            <p className="mt-2 text-xs leading-6 text-[#806f62]">
              प्रत्येक आगंतुक के लिए एक टिकट आवश्यक है।
            </p>
          </div>

          {/* Name */}
          <div>
            <label htmlFor="tour-name" className="mb-2 block text-sm font-semibold">
              संपर्क व्यक्ति का नाम <span className="text-red-600">*</span>
            </label>
            <input
              id="tour-name"
              autoComplete="name"
              value={form.name}
              disabled={isBusy || paymentState === "success"}
              onChange={(e) => update("name", e.target.value)}
              placeholder="पूरा नाम"
              className={`${fieldClass} disabled:bg-gray-100`}
            />
            {errors.name && <p className="mt-1 text-xs text-red-700">{errors.name}</p>}
          </div>

          {/* Mobile */}
          <div>
            <label htmlFor="tour-mobile" className="mb-2 block text-sm font-semibold">
              मोबाइल नंबर <span className="text-red-600">*</span>
            </label>
            <input
              id="tour-mobile"
              type="tel"
              inputMode="numeric"
              autoComplete="tel-national"
              maxLength={10}
              value={form.mobile}
              disabled={isBusy || paymentState === "success"}
              onChange={(e) =>
                update("mobile", e.target.value.replace(/\D/g, "").slice(0, 10))
              }
              placeholder="10 अंकों का मोबाइल नंबर"
              className={`${fieldClass} disabled:bg-gray-100`}
            />
            {errors.mobile && (
              <p className="mt-1 text-xs text-red-700">{errors.mobile}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="tour-email" className="mb-2 block text-sm font-semibold">
              ईमेल पता <span className="text-[#968475]">(वैकल्पिक)</span>
            </label>
            <input
              id="tour-email"
              type="email"
              autoComplete="email"
              value={form.email}
              disabled={isBusy || paymentState === "success"}
              onChange={(e) => update("email", e.target.value)}
              placeholder="name@example.com"
              className={`${fieldClass} disabled:bg-gray-100`}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-700">{errors.email}</p>
            )}
          </div>

          {/* Amount summary */}
          <div className="rounded-xl border border-[#e8ddca] bg-[#fbf7ef] p-5">
            <h3 className="font-bold">टिकट शुल्क विवरण</h3>
            <div className="mt-4 flex items-center justify-between gap-4 text-sm">
              <span className="text-[#806f62]">प्रति व्यक्ति शुल्क</span>
              <span className="font-semibold">₹20</span>
            </div>
            <div className="mt-3 flex items-center justify-between gap-4 text-sm">
              <span className="text-[#806f62]">कुल आगंतुक</span>
              <span className="font-semibold">{visitorCount}</span>
            </div>
            <div className="my-4 h-px bg-[#e8ddca]" />
            <div className="flex items-center justify-between gap-4">
              <span className="font-bold">कुल टिकट शुल्क</span>
              <span className="text-2xl font-bold text-[#7b1b26]">₹{totalAmount}</span>
            </div>
          </div>

          {/* Submit / Download button */}
          {paymentState === "success" && booking ? (
            <button
              type="button"
              onClick={downloadTicket}
              disabled={isDownloading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#7b1b26] px-5 py-3.5 font-bold text-white transition hover:bg-[#5f111c] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isDownloading ? (
                <LoaderCircle size={18} className="animate-spin" />
              ) : (
                <Download size={18} />
              )}
              {isDownloading ? "टिकट तैयार हो रहा है…" : "टिकट डाउनलोड करें"}
            </button>
          ) : (
            <button
              type="submit"
              disabled={isBusy}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#7b1b26] px-5 py-3.5 font-bold text-white transition hover:bg-[#5f111c] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isBusy ? (
                <>
                  <LoaderCircle size={18} className="animate-spin" />
                  कृपया प्रतीक्षा करें…
                </>
              ) : (
                <>
                  भुगतान करें — ₹{totalAmount}
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          )}

          <p className="text-xs leading-6 text-[#89796a]">
            टिकट केवल सर्वर द्वारा भुगतान की पुष्टि के बाद जारी होगा। भुगतान विंडो बंद
            होने या नेटवर्क समस्या आने पर दोबारा भुगतान करने से पहले भुगतान की स्थिति
            जाँचें।
          </p>
        </form>

        {/* ── Sidebar ── */}
        <aside className="space-y-5">
          <div className="rounded-2xl bg-[#4b111d] p-6 text-[#fff5e4]">
            <Ticket size={28} className="text-[#e8c77f]" />
            <h2 className="mt-4 text-xl font-bold">एक टिकट, पाँच स्तर</h2>
            <p className="mt-3 text-sm leading-7 text-[#f2dfce]">
              प्रस्तावित टूर में भूमि तल तथा प्रथम, द्वितीय, तृतीय और चतुर्थ तल शामिल हैं।
            </p>
            <div className="mt-5 border-t border-white/15 pt-4">
              <p className="text-sm text-[#e8c77f]">टिकट शुल्क</p>
              <p className="mt-1 text-3xl font-bold">₹20</p>
              <p className="mt-1 text-sm text-[#f2dfce]">प्रति व्यक्ति</p>
            </div>
          </div>

          <div className="rounded-2xl border border-[#e8ddca] bg-white p-5">
            <h3 className="font-bold">महत्वपूर्ण जानकारी</h3>
            <div className="mt-4 space-y-4 text-sm leading-6 text-[#806f62]">
              <p className="flex items-start gap-2">
                <Clock3 size={18} className="mt-1 shrink-0 text-[#9a642a]" />
                भ्रमण समय एवं उपलब्धता की पुष्टि आवश्यक है।
              </p>
              <p className="flex items-start gap-2">
                <Info size={18} className="mt-1 shrink-0 text-[#9a642a]" />
                टिकट जारी होने के बाद ही बुकिंग की पुष्टि मानी जाएगी।
              </p>
              <p className="flex items-start gap-2">
                <MapPin size={18} className="mt-1 shrink-0 text-[#9a642a]" />
                खटंगिया, दौना रोड, जसरा, प्रयागराज, उत्तर प्रदेश।
              </p>
            </div>
          </div>
        </aside>
      </section>

      {/* ══════════════════════════════════════════════
          OFF-SCREEN RECEIPT for PDF capture
      ══════════════════════════════════════════════ */}
      {booking && paymentState === "success" && (
        <TourTicketReceipt booking={booking} receiptRef={receiptRef} />
      )}
    </main>
  );
}
