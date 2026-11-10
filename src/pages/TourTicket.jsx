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
  QrCode,
  Ticket,
  Users,
  X,
} from "lucide-react";
import upiQrImage from "../assets/upi-qr.png";
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  runTransaction,
} from "firebase/firestore";
import { db } from "../config/firebase";
import TourTicketReceipt from "../components/tourTicket/TourTicketReceipt";
import generateTourTicketPDF from "../utils/generateTourTicketPDF";

/* ─────────────────────────────────────────────────────────
   Constants
───────────────────────────────────────────────────────── */
const TICKET_PRICE = 20;
const UPI_ID       = "s3222094@oksbi";
const UPI_NAME     = "Sushil Kumar Dwivedi";

const initialForm = {
  date:     "",
  visitors: "1",
  name:     "",
  mobile:   "",
  email:    "",
  utr:      "",
};

const fieldClass =
  "w-full rounded-xl border border-[#e6dccd] bg-white px-4 py-3 text-sm outline-none focus:border-[#8a2630] focus:ring-2 focus:ring-[#8a2630]/10";

/* ─────────────────────────────────────────────────────────
   Helpers
───────────────────────────────────────────────────────── */
function getTodayLocalDate() {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);
}

function formatDate(dateString) {
  if (!dateString) return "—";
  return new Date(`${dateString}T00:00:00`).toLocaleDateString("hi-IN", {
    day: "numeric", month: "long", year: "numeric",
  });
}

/* ─────────────────────────────────────────────────────────
   Sequential ticket number via Firestore counter
───────────────────────────────────────────────────────── */
async function generateTicketNumber() {
  const year       = new Date().getFullYear();
  const counterRef = doc(db, "counters", `tour_tickets_${year}`);
  const seq = await runTransaction(db, async (tx) => {
    const snap    = await tx.get(counterRef);
    const current = snap.exists() ? (snap.data().seq || 0) : 0;
    const next    = current + 1;
    tx.set(counterRef, { seq: next, year });
    return next;
  });
  return `SKDM-${year}-${String(seq).padStart(7, "0")}`;
}

/* ─────────────────────────────────────────────────────────
   Save booking to Firestore
───────────────────────────────────────────────────────── */
async function saveBooking(data) {
  await addDoc(collection(db, "tour_bookings"), {
    ticketNumber:  data.ticketNumber,
    contactName:   data.contactName,
    mobile:        data.mobile,
    email:         data.email       || null,
    visitDate:     data.visitDate,
    visitorCount:  data.visitorCount,
    amount:        data.amount,
    utrNumber:     data.utrNumber,
    paymentStatus: "upi_submitted",
    status:        "confirmed",
    issuedAt:      serverTimestamp(),
  });
}

/* ═══════════════════════════════════════════════════════════
   COMPONENT
═══════════════════════════════════════════════════════════ */
export default function TourTicket() {
  const [form,             setForm]             = useState(initialForm);
  const [errors,           setErrors]           = useState({});
  const [step,             setStep]             = useState("form");   // form | payment | success
  const [booking,          setBooking]          = useState(null);
  const [submitting,       setSubmitting]       = useState(false);
  const [isDownloading,    setIsDownloading]    = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  const receiptRef   = useRef(null);
  const visitorCount = Number(form.visitors);
  const totalAmount  = visitorCount * TICKET_PRICE;
  const minDate      = useMemo(() => getTodayLocalDate(), []);

  /* ── field updater ── */
  const update = (field, value) => {
    setForm((old) => ({ ...old, [field]: value }));
    setErrors((old) => ({ ...old, [field]: "" }));
  };

  /* ── Step 1 validation (form details) ── */
  const validateForm = () => {
    const next = {};
    if (!form.date)
      next.date = "कृपया भ्रमण की तारीख चुनें।";
    else if (form.date < minDate)
      next.date = "कृपया आज या उसके बाद की तारीख चुनें।";
    if (!form.name.trim())
      next.name = "कृपया अपना नाम दर्ज करें।";
    if (!/^[6-9]\d{9}$/.test(form.mobile))
      next.mobile = "कृपया 10 अंकों का सही मोबाइल नंबर दर्ज करें।";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      next.email = "कृपया सही ईमेल पता दर्ज करें।";
    if (!Number.isInteger(visitorCount) || visitorCount < 1 || visitorCount > 20)
      next.visitors = "कृपया 1 से 20 तक आगंतुकों की संख्या चुनें।";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  /* ── Step 2 validation (UTR) ── */
  const validateUTR = () => {
    const next = {};
    const utr = form.utr.trim();
    if (!utr)
      next.utr = "कृपया UTR / Transaction ID दर्ज करें।";
    else if (utr.length < 8)
      next.utr = "UTR कम से कम 8 अंकों का होना चाहिए।";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  /* ── Step 1 → Show QR ── */
  const handleProceedToPayment = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setStep("payment");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* ── Step 2 → Confirm booking ── */
  const handleConfirmPayment = async (e) => {
    e.preventDefault();
    if (!validateUTR()) return;

    setSubmitting(true);
    try {
      const ticketNumber = await generateTicketNumber();
      const bookingData  = {
        ticketNumber,
        contactName:  form.name.trim(),
        mobile:       form.mobile,
        email:        form.email.trim() || "",
        visitDate:    form.date,
        visitorCount,
        amount:       totalAmount,
        utrNumber:    form.utr.trim(),
        issuedAt:     new Date().toISOString(),
      };

      await saveBooking(bookingData);
      setBooking(bookingData);
      setStep("success");
      setShowSuccessPopup(true);
    } catch (err) {
      setErrors({ utr: "बुकिंग दर्ज नहीं हो सकी। कृपया पुनः प्रयास करें।" });
    } finally {
      setSubmitting(false);
    }
  };

  /* ── PDF download ── */
  const downloadTicket = async () => {
    if (!booking || !receiptRef.current) return;
    setIsDownloading(true);
    try {
      await generateTourTicketPDF(receiptRef.current, booking.ticketNumber);
    } catch (err) {
      console.error(err);
    } finally {
      setIsDownloading(false);
    }
  };

  /* ═══════════════════════════════════════════════════════════
     RENDER
  ═══════════════════════════════════════════════════════════ */
  return (
    <main className="min-h-screen bg-[#fbf7ef] text-[#43231f]">

      {/* ── Success Popup ── */}
      {showSuccessPopup && booking && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm"
        >
          <div className="relative w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
            <button
              onClick={() => setShowSuccessPopup(false)}
              aria-label="बंद करें"
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-[#f6ecd9] text-[#8c5b25] transition hover:bg-[#ecd9b8]"
            >
              <X size={18} />
            </button>

            <div className="flex justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#fff4dd] text-[#e8a020]">
                <PartyPopper size={40} />
              </div>
            </div>

            <div className="mt-5 text-center">
              <h2 className="text-2xl font-bold text-[#2d6a2d]">बुकिंग सफल रही!</h2>
              <p className="mt-3 text-base font-semibold text-[#43231f]">
                नमस्ते, <span className="text-[#7b1b26]">{booking.contactName}</span> जी 🙏
              </p>
              <p className="mt-2 text-sm leading-7 text-[#806f62]">
                आपकी बुकिंग दर्ज हो गई है। भुगतान की पुष्टि होने पर
                मंदिर प्रशासन से संपर्क किया जाएगा।
              </p>

              <div className="mt-4 rounded-xl border border-[#dfc58f] bg-[#fff8e8] px-5 py-3">
                <p className="text-xs font-semibold text-[#806f62]">टिकट संख्या</p>
                <p className="mt-1 font-bold text-[#7b1b26]">{booking.ticketNumber}</p>
              </div>

              <div className="mt-3 flex items-center justify-center gap-4 text-sm">
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

            <button
              onClick={async () => { setShowSuccessPopup(false); await downloadTicket(); }}
              disabled={isDownloading}
              className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-[#7b1b26] py-3 font-bold text-white transition hover:bg-[#5f111c] disabled:opacity-70"
            >
              {isDownloading
                ? <><LoaderCircle size={18} className="animate-spin" /> टिकट तैयार हो रहा है…</>
                : <><Download size={18} /> टिकट PDF डाउनलोड करें</>}
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

      {/* ── Hero ── */}
      <section className="bg-[#4b111d]">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
          <Link to="/tourism" className="inline-flex items-center gap-2 text-sm text-[#e8c77f] hover:text-white">
            <ArrowLeft size={17} />
            पर्यटन पृष्ठ पर वापस जाएँ
          </Link>
          <p className="mt-6 text-sm font-semibold text-[#e8c77f]">मंदिर पर्यटन</p>
          <h1 className="mt-2 text-3xl font-bold text-[#fff5e4] sm:text-4xl">मंदिर भ्रमण टिकट</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-[#f2dfce] sm:text-base">
            भूमि तल और चारों ऊपरी तल के भ्रमण के लिए एक ही टूर टिकट।
            टिकट शुल्क ₹{TICKET_PRICE} प्रति व्यक्ति है।
          </p>
        </div>
      </section>

      {/* ── Step Progress ── */}
      <div className="border-b border-[#e8ddca] bg-white">
        <div className="mx-auto flex max-w-2xl items-center gap-0 px-4 py-4">
          {[
            { n: 1, label: "विवरण भरें" },
            { n: 2, label: "UPI भुगतान" },
            { n: 3, label: "टिकट डाउनलोड" },
          ].map(({ n, label }, i) => {
            const stepNum = step === "form" ? 1 : step === "payment" ? 2 : 3;
            const done    = stepNum > n;
            const active  = stepNum === n;
            return (
              <div key={n} className="flex flex-1 items-center">
                <div className="flex flex-col items-center gap-1">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-colors
                    ${done   ? "bg-[#2d6a2d] text-white" :
                      active ? "bg-[#7b1b26] text-white" :
                               "bg-[#e8ddca] text-[#9b8880]"}`}>
                    {done ? <CheckCircle2 size={16} /> : n}
                  </div>
                  <p className={`text-[10px] font-semibold ${active ? "text-[#7b1b26]" : done ? "text-[#2d6a2d]" : "text-[#9b8880]"}`}>
                    {label}
                  </p>
                </div>
                {i < 2 && <div className={`mx-2 h-0.5 flex-1 ${done ? "bg-[#2d6a2d]" : "bg-[#e8ddca]"}`} />}
              </div>
            );
          })}
        </div>
      </div>

      <section className="mx-auto max-w-2xl px-4 py-8 sm:px-6">

        {/* ══════════════════════════════════════════════
            STEP 1 — FORM DETAILS
        ══════════════════════════════════════════════ */}
        {step === "form" && (
          <form onSubmit={handleProceedToPayment} noValidate className="space-y-5 rounded-2xl border border-[#e8ddca] bg-white p-6">
            <div className="flex items-center gap-3">
              <Ticket size={24} className="text-[#9a642a]" />
              <div>
                <h2 className="text-xl font-bold">टिकट बुकिंग विवरण</h2>
                <p className="text-sm text-[#806f62]">जानकारी भरें, फिर UPI से भुगतान करें।</p>
              </div>
            </div>

            {/* Date */}
            <div>
              <label htmlFor="tour-date" className="mb-2 block text-sm font-semibold">
                भ्रमण की तारीख <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <CalendarDays size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#968475]" />
                <input
                  id="tour-date" type="date" min={minDate}
                  value={form.date} onChange={(e) => update("date", e.target.value)}
                  className={`${fieldClass} pl-10`}
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
                <Users size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#968475]" />
                <select
                  id="tour-visitors"
                  value={form.visitors} onChange={(e) => update("visitors", e.target.value)}
                  className={`${fieldClass} pl-10`}
                >
                  {Array.from({ length: 20 }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>{n} आगंतुक</option>
                  ))}
                </select>
              </div>
              {errors.visitors && <p className="mt-1 text-xs text-red-700">{errors.visitors}</p>}
            </div>

            {/* Name */}
            <div>
              <label htmlFor="tour-name" className="mb-2 block text-sm font-semibold">
                संपर्क व्यक्ति का नाम <span className="text-red-600">*</span>
              </label>
              <input
                id="tour-name" autoComplete="name" placeholder="पूरा नाम"
                value={form.name} onChange={(e) => update("name", e.target.value)}
                className={fieldClass}
              />
              {errors.name && <p className="mt-1 text-xs text-red-700">{errors.name}</p>}
            </div>

            {/* Mobile */}
            <div>
              <label htmlFor="tour-mobile" className="mb-2 block text-sm font-semibold">
                मोबाइल नंबर <span className="text-red-600">*</span>
              </label>
              <input
                id="tour-mobile" type="tel" inputMode="numeric" maxLength={10}
                placeholder="10 अंकों का मोबाइल नंबर"
                value={form.mobile}
                onChange={(e) => update("mobile", e.target.value.replace(/\D/g, "").slice(0, 10))}
                className={fieldClass}
              />
              {errors.mobile && <p className="mt-1 text-xs text-red-700">{errors.mobile}</p>}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="tour-email" className="mb-2 block text-sm font-semibold">
                ईमेल पता <span className="text-[#968475]">(वैकल्पिक)</span>
              </label>
              <input
                id="tour-email" type="email" placeholder="name@example.com"
                value={form.email} onChange={(e) => update("email", e.target.value)}
                className={fieldClass}
              />
              {errors.email && <p className="mt-1 text-xs text-red-700">{errors.email}</p>}
            </div>

            {/* Amount summary */}
            <div className="rounded-xl border border-[#e8ddca] bg-[#fbf7ef] p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#806f62]">प्रति व्यक्ति</span>
                <span className="font-semibold">₹{TICKET_PRICE}</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="text-[#806f62]">आगंतुक</span>
                <span className="font-semibold">{visitorCount}</span>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-[#e8ddca] pt-3">
                <span className="font-bold">कुल शुल्क</span>
                <span className="text-2xl font-bold text-[#7b1b26]">₹{totalAmount}</span>
              </div>
            </div>

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#7b1b26] py-3.5 font-bold text-white transition hover:bg-[#5f111c]"
            >
              आगे बढ़ें — UPI से भुगतान करें
              <ArrowRight size={18} />
            </button>
          </form>
        )}

        {/* ══════════════════════════════════════════════
            STEP 2 — QR + UTR
        ══════════════════════════════════════════════ */}
        {step === "payment" && (
          <div className="space-y-5">
            {/* Amount reminder */}
            <div className="rounded-2xl border border-[#e8ddca] bg-white p-5 text-center">
              <p className="text-sm text-[#806f62]">भुगतान राशि</p>
              <p className="mt-1 text-4xl font-bold text-[#7b1b26]">₹{totalAmount}</p>
              <p className="mt-1 text-xs text-[#968475]">
                {visitorCount} आगंतुक × ₹{TICKET_PRICE} — {formatDate(form.date)}
              </p>
            </div>

            {/* QR Code card */}
            <div className="overflow-hidden rounded-2xl border border-[#e8ddca] bg-white">
              <div className="bg-[#4b111d] px-5 py-4 text-center">
                <div className="flex items-center justify-center gap-2 text-[#e8c77f]">
                  <QrCode size={20} />
                  <h2 className="font-bold">UPI से भुगतान करें</h2>
                </div>
                <p className="mt-1 text-xs text-[#f2dfce]">
                  नीचे QR स्कैन करें या UPI ID पर भुगतान करें
                </p>
              </div>

              <div className="p-6">
                {/* QR Image */}
                <div className="flex justify-center">
                  <div className="rounded-2xl border-2 border-[#e8ddca] bg-white p-3 shadow-sm">
                    <img
                      src={upiQrImage}
                      alt="UPI QR Code"
                      className="h-56 w-56 object-contain"
                    />
                  </div>
                </div>

                {/* UPI ID */}
                <div className="mt-4 rounded-xl border border-[#e8ddca] bg-[#fbf7ef] p-4 text-center">
                  <p className="text-xs font-semibold text-[#806f62]">UPI ID</p>
                  <p className="mt-1 font-bold text-[#4b111d] tracking-wide text-lg">{UPI_ID}</p>
                  <p className="mt-0.5 text-sm text-[#806f62]">{UPI_NAME}</p>
                </div>

                {/* Steps */}
                <div className="mt-4 space-y-2">
                  {[
                    "GPay, PhonePe या कोई भी UPI app खोलें",
                    `QR scan करें या UPI ID "${UPI_ID}" डालें`,
                    `₹${totalAmount} का भुगतान करें`,
                    "Transaction ID (UTR) नोट करें",
                  ].map((step, i) => (
                    <div key={i} className="flex items-start gap-3 text-sm text-[#4a3020]">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#7b1b26] text-xs font-bold text-white">
                        {i + 1}
                      </span>
                      {step}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* UTR form */}
            <form onSubmit={handleConfirmPayment} noValidate className="rounded-2xl border border-[#e8ddca] bg-white p-6 space-y-4">
              <div>
                <h3 className="font-bold text-[#4b111d]">भुगतान की पुष्टि करें</h3>
                <p className="mt-1 text-sm text-[#806f62]">
                  भुगतान के बाद GPay/PhonePe से मिला <strong>Transaction ID (UTR)</strong> दर्ज करें।
                </p>
              </div>

              <div>
                <label htmlFor="utr" className="mb-2 block text-sm font-semibold">
                  Transaction ID / UTR Number <span className="text-red-600">*</span>
                </label>
                <input
                  id="utr"
                  type="text"
                  inputMode="numeric"
                  placeholder="जैसे: 425612345678"
                  value={form.utr}
                  onChange={(e) => update("utr", e.target.value.trim())}
                  className={fieldClass}
                />
                {errors.utr && <p className="mt-1 text-xs text-red-700">{errors.utr}</p>}
                <p className="mt-2 text-xs leading-5 text-[#806f62]">
                  GPay: भुगतान के बाद Transaction details में UPI Transaction ID मिलेगी।
                  PhonePe: Transaction History → UPI Reference Number।
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep("form")}
                  className="flex-1 rounded-xl border border-[#e8ddca] py-3 text-sm font-semibold text-[#806f62] transition hover:bg-[#fbf7ef]"
                >
                  ← वापस
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#7b1b26] py-3 font-bold text-white transition hover:bg-[#5f111c] disabled:opacity-60"
                >
                  {submitting
                    ? <><LoaderCircle size={16} className="animate-spin" /> टिकट बन रहा है…</>
                    : <><CheckCircle2 size={16} /> बुकिंग पूरी करें</>}
                </button>
              </div>

              <p className="flex items-start gap-2 text-xs leading-5 text-[#806f62]">
                <Info size={14} className="mt-0.5 shrink-0 text-[#9a642a]" />
                भुगतान की जाँच मंदिर प्रशासन द्वारा की जाएगी। गलत UTR देने पर बुकिंग रद्द हो सकती है।
              </p>
            </form>
          </div>
        )}

        {/* ══════════════════════════════════════════════
            STEP 3 — SUCCESS
        ══════════════════════════════════════════════ */}
        {step === "success" && booking && (
          <div className="rounded-2xl border border-[#e8ddca] bg-white p-6 text-center space-y-4">
            <div className="flex justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#f0faf0] text-[#2d6a2d]">
                <CheckCircle2 size={40} />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-[#2d6a2d]">बुकिंग दर्ज हो गई!</h2>
            <div className="rounded-xl border border-[#dfc58f] bg-[#fff8e8] px-5 py-3">
              <p className="text-xs text-[#806f62]">टिकट संख्या</p>
              <p className="mt-1 font-bold text-[#7b1b26] text-lg">{booking.ticketNumber}</p>
            </div>
            <p className="text-sm text-[#806f62]">
              UTR: <span className="font-semibold text-[#4b111d]">{booking.utrNumber}</span>
            </p>
            <button
              onClick={downloadTicket}
              disabled={isDownloading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#7b1b26] py-3 font-bold text-white transition hover:bg-[#5f111c] disabled:opacity-70"
            >
              {isDownloading
                ? <><LoaderCircle size={18} className="animate-spin" /> टिकट तैयार हो रहा है…</>
                : <><Download size={18} /> टिकट PDF डाउनलोड करें</>}
            </button>
          </div>
        )}
      </section>

      {/* Off-screen receipt for PDF */}
      {booking && step === "success" && (
        <TourTicketReceipt booking={booking} receiptRef={receiptRef} />
      )}
    </main>
  );
}
