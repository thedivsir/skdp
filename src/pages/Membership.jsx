import { useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  HandHeart,
  HeartHandshake,
  Info,
  LockKeyhole,
  Phone,
  QrCode,
  UserRound,
  Users,
  X,
  PartyPopper,
} from "lucide-react";
import upiQrImage from "../assets/upi-qr.png";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../config/firebase";

/* ─────────────────────────────────────────────────────────
   Constants
───────────────────────────────────────────────────────── */
const UPI_ID   = "s3222094@oksbi";
const UPI_NAME = "Sushil Kumar Dwivedi";

const initialForm = { name: "", mobile: "", email: "", address: "" };

const fieldClass =
  "w-full rounded-xl border border-[#e6dccd] bg-white px-4 py-3 text-sm outline-none focus:border-[#8a2630] focus:ring-2 focus:ring-[#8a2630]/10";

/* ═══════════════════════════════════════════════════════════
   MEMBERSHIP PAGE
═══════════════════════════════════════════════════════════ */
export default function Membership() {
  const [form,    setForm]    = useState(initialForm);
  const [amount,  setAmount]  = useState("100");
  const [utr,     setUtr]     = useState("");
  const [errors,  setErrors]  = useState({});
  const [step,    setStep]    = useState("form");     // form | payment | success
  const [submitting, setSubmitting] = useState(false);
  const [submitted,  setSubmitted]  = useState(false);

  const update = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  /* ── Step 1 validation ── */
  const validateForm = () => {
    const next = {};
    if (form.name.trim().length < 2)
      next.name = "कृपया अपना पूरा नाम दर्ज करें।";
    if (!/^[6-9]\d{9}$/.test(form.mobile.trim()))
      next.mobile = "कृपया 10 अंकों का सही मोबाइल नंबर दर्ज करें।";
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      next.email = "कृपया सही ईमेल पता दर्ज करें।";
    if (!form.address.trim())
      next.address = "कृपया अपना पूरा पता दर्ज करें।";
    const n = Number(amount);
    if (!Number.isSafeInteger(n) || n < 100 || n > 100_000)
      next.amount = "सदस्यता शुल्क ₹100 से ₹1,00,000 के बीच होना चाहिए।";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  /* ── Step 2 validation ── */
  const validateUTR = () => {
    const next = {};
    if (!utr.trim())
      next.utr = "कृपया UTR / Transaction ID दर्ज करें।";
    else if (utr.trim().length < 8)
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

  /* ── Step 2 → Confirm ── */
  const handleConfirmPayment = async (e) => {
    e.preventDefault();
    if (!validateUTR()) return;

    setSubmitting(true);
    try {
      await addDoc(collection(db, "memberships"), {
        name:        form.name.trim(),
        mobile:      form.mobile.trim(),
        email:       form.email.trim() || null,
        address:     form.address.trim(),
        amount:      Number(amount),
        utrNumber:   utr.trim(),
        status:      "upi_submitted",
        submittedAt: serverTimestamp(),
      });
      setStep("success");
      setSubmitted(true);
    } catch {
      setErrors({ utr: "डेटा सहेजने में समस्या आई। कृपया पुनः प्रयास करें।" });
    } finally {
      setSubmitting(false);
    }
  };

  /* ═══════════════════════════════════════════════════════════
     RENDER
  ═══════════════════════════════════════════════════════════ */
  return (
    <main className="min-h-screen bg-[#fbf7ef] text-[#43231f]">

      {/* ── Success Popup ── */}
      {submitted && step === "success" && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm"
        >
          <div className="relative w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
            <button
              onClick={() => setSubmitted(false)}
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
              <h2 className="text-2xl font-bold text-[#2d6a2d]">आवेदन सफल रहा!</h2>
              <p className="mt-3 text-base font-semibold text-[#43231f]">
                नमस्ते, <span className="text-[#7b1b26]">{form.name}</span> जी 🙏
              </p>
              <p className="mt-2 text-sm leading-7 text-[#806f62]">
                आपका सदस्यता आवेदन दर्ज हो गया है। भुगतान की पुष्टि होने पर
                मंदिर प्रशासन आपसे संपर्क करेगा।
              </p>
              <div className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#f0faf0] px-5 py-3">
                <CheckCircle2 size={18} className="text-[#2d6a2d]" />
                <span className="text-sm font-bold text-[#2d6a2d]">₹{amount} का आवेदन दर्ज हुआ</span>
              </div>
              <p className="mt-3 text-xs text-[#968475]">
                UTR: <span className="font-semibold">{utr}</span>
              </p>
            </div>

            <button
              onClick={() => {
                setSubmitted(false);
                setForm(initialForm);
                setAmount("100");
                setUtr("");
                setStep("form");
              }}
              className="mt-7 w-full rounded-xl bg-[#7b1b26] py-3 font-bold text-white transition hover:bg-[#5f111c]"
            >
              ठीक है, धन्यवाद
            </button>
          </div>
        </div>
      )}

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-[#4b111d]">
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-25"
          style={{
            backgroundImage:
              "radial-gradient(circle at 15% 20%, #e8bd69, transparent 32%), radial-gradient(circle at 90% 80%, #a65b39, transparent 30%)",
          }}
        />
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
          <div>
            <p className="inline-flex items-center gap-2 text-sm font-semibold text-[#e8c77f]">
              <HeartHandshake size={19} />
              सेवा • सहभागिता • समर्पण
            </p>
            <h1 className="mt-4 text-3xl font-bold leading-tight text-[#fff5e4] sm:text-5xl">मंदिर सदस्यता</h1>
            <p className="mt-5 max-w-xl text-base leading-8 text-[#f2dfce]">
              श्री कैलाश धाम मंदिर से जुड़ने और मंदिर की गतिविधियों में
              सहभागिता के लिए सदस्यता हेतु आवेदन करें।
            </p>
          </div>

          <div className="rounded-3xl border border-[#e8c77f]/30 bg-white/5 p-6 sm:p-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e8bd69]/15 text-[#e8c77f]">
              <BadgeCheck size={30} />
            </div>
            <h2 className="mt-5 text-xl font-bold text-[#fff5e4]">सदस्य बनने की प्रक्रिया</h2>
            <div className="mt-5 space-y-4">
              {[
                "अपना आवेदन विवरण और सदस्यता राशि भरें।",
                "UPI QR से भुगतान करें।",
                "Transaction ID (UTR) दर्ज करके आवेदन पूरा करें।",
              ].map((item, i) => (
                <div key={item} className="flex items-start gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#e8c77f]/40 text-sm font-bold text-[#e8c77f]">
                    {i + 1}
                  </span>
                  <p className="pt-1 text-sm leading-6 text-[#f2dfce]">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="h-1 bg-gradient-to-r from-[#95612c] via-[#f0d18b] to-[#95612c]" />
      </section>

      {/* ── Main content ── */}
      <section className="mx-auto grid max-w-7xl items-start gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:px-8">

        {/* ══════════════════════════════════════════════
            STEP 1 — FORM
        ══════════════════════════════════════════════ */}
        {step === "form" && (
          <form onSubmit={handleProceedToPayment} noValidate className="rounded-2xl border border-[#e8ddca] bg-white p-5 sm:p-8">
            <div className="mb-6 flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#f6ecd9] text-[#8c5b25]">
                <UserRound size={25} />
              </span>
              <div>
                <h2 className="text-xl font-bold sm:text-2xl">सदस्यता आवेदन</h2>
                <p className="mt-1 text-sm text-[#806f62]">सभी आवश्यक विवरण भरें।</p>
              </div>
            </div>

            <div className="space-y-5">
              {/* Name */}
              <div>
                <label htmlFor="member-name" className="mb-2 block text-sm font-semibold">
                  पूरा नाम <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <UserRound size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#968475]" />
                  <input
                    id="member-name" autoComplete="name" placeholder="अपना पूरा नाम"
                    value={form.name} onChange={(e) => update("name", e.target.value)}
                    className={`${fieldClass} pl-10`}
                  />
                </div>
                {errors.name && <p className="mt-1 text-xs text-red-700">{errors.name}</p>}
              </div>

              {/* Mobile */}
              <div>
                <label htmlFor="member-mobile" className="mb-2 block text-sm font-semibold">
                  मोबाइल नंबर <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <Phone size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#968475]" />
                  <input
                    id="member-mobile" type="tel" inputMode="numeric" maxLength={10}
                    placeholder="10 अंकों का मोबाइल नंबर"
                    value={form.mobile}
                    onChange={(e) => update("mobile", e.target.value.replace(/\D/g, "").slice(0, 10))}
                    className={`${fieldClass} pl-10`}
                  />
                </div>
                {errors.mobile && <p className="mt-1 text-xs text-red-700">{errors.mobile}</p>}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="member-email" className="mb-2 block text-sm font-semibold">
                  ईमेल पता <span className="text-[#968475]">(वैकल्पिक)</span>
                </label>
                <input
                  id="member-email" type="email" placeholder="name@example.com"
                  value={form.email} onChange={(e) => update("email", e.target.value)}
                  className={fieldClass}
                />
                {errors.email && <p className="mt-1 text-xs text-red-700">{errors.email}</p>}
              </div>

              {/* Address */}
              <div>
                <label htmlFor="member-address" className="mb-2 block text-sm font-semibold">
                  पूरा पता <span className="text-red-600">*</span>
                </label>
                <textarea
                  id="member-address" rows={3} maxLength={500}
                  placeholder="ग्राम/शहर, जिला, राज्य और पिन कोड"
                  value={form.address} onChange={(e) => update("address", e.target.value)}
                  className={`${fieldClass} resize-y`}
                />
                {errors.address && <p className="mt-1 text-xs text-red-700">{errors.address}</p>}
              </div>

              {/* Amount */}
              <div>
                <label htmlFor="membership-amount" className="mb-2 block text-sm font-semibold">
                  सदस्यता शुल्क (₹) <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-semibold text-[#8c5b25]">₹</span>
                  <input
                    id="membership-amount" type="number" min="100" max="100000" step="1"
                    inputMode="numeric" placeholder="न्यूनतम 100"
                    value={amount}
                    onChange={(e) => { setAmount(e.target.value); setErrors((p) => ({ ...p, amount: "" })); }}
                    className={`${fieldClass} pl-9`}
                  />
                </div>
                {errors.amount && <p className="mt-1 text-xs text-red-700">{errors.amount}</p>}
                <p className="mt-1 text-xs text-[#806f62]">न्यूनतम ₹100</p>
              </div>
            </div>

            <button
              type="submit"
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#7b1b26] px-5 py-3.5 font-bold text-white transition hover:bg-[#5f111c]"
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
            {/* Amount */}
            <div className="rounded-2xl border border-[#e8ddca] bg-white p-5 text-center">
              <p className="text-sm text-[#806f62]">भुगतान राशि</p>
              <p className="mt-1 text-4xl font-bold text-[#7b1b26]">₹{amount}</p>
              <p className="mt-1 text-xs text-[#968475]">सदस्यता शुल्क — {form.name}</p>
            </div>

            {/* QR */}
            <div className="overflow-hidden rounded-2xl border border-[#e8ddca] bg-white">
              <div className="bg-[#4b111d] px-5 py-4 text-center">
                <div className="flex items-center justify-center gap-2 text-[#e8c77f]">
                  <QrCode size={20} />
                  <h2 className="font-bold">UPI से भुगतान करें</h2>
                </div>
                <p className="mt-1 text-xs text-[#f2dfce]">QR स्कैन करें या UPI ID पर भुगतान करें</p>
              </div>

              <div className="p-6">
                <div className="flex justify-center">
                  <div className="rounded-2xl border-2 border-[#e8ddca] bg-white p-3 shadow-sm">
                    <img
                      src={upiQrImage}
                      alt="UPI QR Code"
                      className="h-56 w-56 object-contain"
                    />
                  </div>
                </div>

                <div className="mt-4 rounded-xl border border-[#e8ddca] bg-[#fbf7ef] p-4 text-center">
                  <p className="text-xs font-semibold text-[#806f62]">UPI ID</p>
                  <p className="mt-1 font-bold text-[#4b111d] tracking-wide text-lg">{UPI_ID}</p>
                  <p className="mt-0.5 text-sm text-[#806f62]">{UPI_NAME}</p>
                </div>

                <div className="mt-4 space-y-2">
                  {[
                    "GPay, PhonePe या कोई भी UPI app खोलें",
                    `QR scan करें या UPI ID "${UPI_ID}" डालें`,
                    `₹${amount} का भुगतान करें`,
                    "Transaction ID (UTR) नोट करें",
                  ].map((s, i) => (
                    <div key={i} className="flex items-start gap-3 text-sm text-[#4a3020]">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#7b1b26] text-xs font-bold text-white">
                        {i + 1}
                      </span>
                      {s}
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
                  भुगतान के बाद मिला <strong>Transaction ID (UTR)</strong> दर्ज करें।
                </p>
              </div>

              <div>
                <label htmlFor="utr-mem" className="mb-2 block text-sm font-semibold">
                  Transaction ID / UTR <span className="text-red-600">*</span>
                </label>
                <input
                  id="utr-mem" type="text" inputMode="numeric"
                  placeholder="जैसे: 425612345678"
                  value={utr}
                  onChange={(e) => { setUtr(e.target.value.trim()); setErrors((p) => ({ ...p, utr: "" })); }}
                  className={fieldClass}
                />
                {errors.utr && <p className="mt-1 text-xs text-red-700">{errors.utr}</p>}
                <p className="mt-2 text-xs text-[#806f62]">
                  GPay: Transaction details → UPI Transaction ID।
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
                    ? "सहेजा जा रहा है…"
                    : <><CheckCircle2 size={16} /> आवेदन पूरा करें</>}
                </button>
              </div>

              <p className="flex items-start gap-2 text-xs text-[#806f62]">
                <Info size={14} className="mt-0.5 shrink-0 text-[#9a642a]" />
                भुगतान की जाँच मंदिर प्रशासन द्वारा की जाएगी।
              </p>
            </form>
          </div>
        )}

        {/* ══════════════════════════════════════════════
            STEP 3 — SUCCESS
        ══════════════════════════════════════════════ */}
        {step === "success" && (
          <div className="rounded-2xl border border-[#e8ddca] bg-white p-8 text-center space-y-4">
            <div className="flex justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#f0faf0] text-[#2d6a2d]">
                <CheckCircle2 size={40} />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-[#2d6a2d]">आवेदन दर्ज हो गया!</h2>
            <p className="text-sm text-[#806f62]">
              UTR: <span className="font-semibold text-[#4b111d]">{utr}</span>
            </p>
            <p className="text-sm text-[#806f62]">
              भुगतान की पुष्टि होने पर मंदिर प्रशासन आपसे संपर्क करेगा।
            </p>
            <button
              onClick={() => { setForm(initialForm); setAmount("100"); setUtr(""); setStep("form"); setSubmitted(false); }}
              className="w-full rounded-xl bg-[#7b1b26] py-3 font-bold text-white transition hover:bg-[#5f111c]"
            >
              नया आवेदन करें
            </button>
          </div>
        )}

        {/* Sidebar */}
        <aside className="space-y-5">
          <div className="rounded-2xl border border-[#e8ddca] bg-white p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#f6ecd9] text-[#8c5b25]">
              <Users size={25} />
            </div>
            <h2 className="mt-4 text-xl font-bold">सदस्यता से जुड़ें</h2>
            <p className="mt-3 text-sm leading-7 text-[#806f62]">
              मंदिर की गतिविधियों से जुड़े रहने और सहभागिता के अवसरों की
              जानकारी प्राप्त करने के लिए आवेदन करें।
            </p>
            <div className="mt-5 border-t border-[#eee3d3] pt-4">
              <p className="text-sm text-[#806f62]">न्यूनतम सदस्यता शुल्क</p>
              <p className="mt-1 text-3xl font-bold text-[#7b1b26]">₹100</p>
            </div>
          </div>

          <div className="rounded-2xl bg-[#4b111d] p-6 text-[#fff5e4]">
            <HandHeart size={28} className="text-[#e8c77f]" />
            <h2 className="mt-4 text-lg font-bold">सेवा और सहभागिता</h2>
            <p className="mt-3 text-sm leading-7 text-[#f2dfce]">
              सदस्यता की शर्तें, लाभ और स्वीकृति की प्रक्रिया मंदिर
              प्रशासन की अनुमोदित नीति के अनुसार होगी।
            </p>
          </div>

          <div className="rounded-2xl border border-[#ead9b7] bg-[#fff4dd] p-5">
            <p className="flex items-start gap-2 text-sm leading-7 text-[#765d47]">
              <LockKeyhole size={18} className="mt-1 shrink-0 text-[#8c5b25]" />
              भुगतान की पुष्टि मंदिर प्रशासन द्वारा UTR के माध्यम से की जाएगी।
            </p>
          </div>
        </aside>
      </section>
    </main>
  );
}
