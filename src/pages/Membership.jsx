
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
  UserRound,
  Users,
  X,
  PartyPopper,
} from "lucide-react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../config/firebase";

/* =========================================================
   Razorpay Checkout Loader
   ========================================================= */

const loadRazorpay = () =>
  new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";

    script.onload = () => resolve(true);
    script.onerror = () =>
      reject(new Error("Razorpay checkout लोड नहीं हो पाया।"));

    document.body.appendChild(script);
  });

/* =========================================================
   Initial Form Values
   ========================================================= */

const initialForm = {
  name: "",
  mobile: "",
  email: "",
  address: "",
};

const fieldClass =
  "w-full rounded-xl border border-[#e6dccd] bg-white px-4 py-3 text-sm outline-none focus:border-[#8a2630] focus:ring-2 focus:ring-[#8a2630]/10";

/* =========================================================
   Membership Page
   ========================================================= */

export default function Membership() {
  const [form, setForm] = useState(initialForm);
  const [amount, setAmount] = useState("100");
  const [errors, setErrors] = useState({});
  const [paymentError, setPaymentError] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("idle");
  const [submitted, setSubmitted] = useState(false);

  const update = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [field]: "",
    }));

    setPaymentError("");
    setSubmitted(false);
  };

  /* =======================================================
     Validate Form
     ======================================================= */

  const validateForm = () => {
    const next = {};

    if (form.name.trim().length < 2) {
      next.name = "कृपया अपना पूरा नाम दर्ज करें।";
    }

    if (!/^[6-9]\d{9}$/.test(form.mobile.trim())) {
      next.mobile = "कृपया 10 अंकों का सही मोबाइल नंबर दर्ज करें।";
    }

    if (
      form.email.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())
    ) {
      next.email = "कृपया सही ईमेल पता दर्ज करें।";
    }

    if (!form.address.trim()) {
      next.address = "कृपया अपना पूरा पता दर्ज करें।";
    }

    const membershipAmount = Number(amount);

    if (
      !Number.isSafeInteger(membershipAmount) ||
      membershipAmount < 100 ||
      membershipAmount > 100_000
    ) {
      next.amount = "सदस्यता शुल्क ₹100 से ₹1,00,000 के बीच होना चाहिए।";
    }

    setErrors(next);

    return Object.keys(next).length === 0;
  };

  /* =======================================================
     Save Membership Data to Firestore
     ======================================================= */

  const saveMembershipToFirestore = async (extraData = {}) => {
    await addDoc(collection(db, "memberships"), {
      name: form.name.trim(),
      mobile: form.mobile.trim(),
      email: form.email.trim() || null,
      address: form.address.trim(),
      amount: Number(amount),
      status: "submitted",
      submittedAt: serverTimestamp(),
      ...extraData,
    });
  };

  /* =======================================================
     Start Razorpay Payment
     ======================================================= */

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (
      paymentStatus === "processing" ||
      paymentStatus === "verifying" ||
      paymentStatus === "success"
    ) {
      return;
    }

    setPaymentError("");
    setSubmitted(false);

    if (!validateForm()) {
      return;
    }

    const apiBase = import.meta.env.VITE_API_BASE_URL;

    if (!apiBase) {
      // No payment backend configured — save form data directly to Firestore
      try {
        await saveMembershipToFirestore({ status: "pending_payment" });
        setPaymentStatus("success");
        setSubmitted(true);
      } catch {
        setPaymentError(
          "डेटा सहेजने में समस्या आई। कृपया बाद में प्रयास करें।"
        );
        setPaymentStatus("idle");
      }
      return;
    }

    setPaymentStatus("processing");

    try {
      await loadRazorpay();

      /* Create an order on the backend.
         The backend must independently validate the amount
         and create the Razorpay order using its secret key. */

      const orderResponse = await fetch(
        `${apiBase}/api/membership/create-order`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: form.name.trim(),
            mobile: form.mobile.trim(),
            email: form.email.trim(),
            address: form.address.trim(),
            amount: Number(amount),
          }),
        }
      );

      const order = await orderResponse.json();

      if (
        !orderResponse.ok ||
        !order.orderId ||
        !order.keyId ||
        !Number.isSafeInteger(Number(order.amount)) ||
        Number(order.amount) < 10000
      ) {
        throw new Error(
          order.message || "भुगतान ऑर्डर नहीं बनाया जा सका।"
        );
      }

      if (order.currency && order.currency !== "INR") {
        throw new Error("भुगतान मुद्रा की जानकारी सही नहीं है।");
      }

      /* Open Razorpay Checkout */

      const checkout = new window.Razorpay({
        key: order.keyId,
        order_id: order.orderId,
        amount: Number(order.amount),
        currency: order.currency || "INR",
        name: "श्री कैलाश धाम मंदिर",
        description: "मंदिर सदस्यता",

        prefill: {
          name: form.name.trim(),
          contact: form.mobile.trim(),
          email: form.email.trim(),
        },

        theme: {
          color: "#7b1b26",
        },

        modal: {
          ondismiss: () => {
            setPaymentStatus("idle");
          },
        },

        /* Razorpay returns payment details here.
           These details are not trusted until verified
           by the backend. */

        handler: async (response) => {
          setPaymentStatus("verifying");
          setPaymentError("");

          try {
            const verifyResponse = await fetch(
              `${apiBase}/api/membership/verify-payment`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  orderId: response.razorpay_order_id,
                  paymentId: response.razorpay_payment_id,
                  signature: response.razorpay_signature,
                }),
              }
            );

            const verification = await verifyResponse.json();

            if (
              !verifyResponse.ok ||
              verification.verified !== true
            ) {
              throw new Error(
                verification.message ||
                  "भुगतान की पुष्टि नहीं हो सकी। कृपया प्रशासन से संपर्क करें।"
              );
            }

            // Save verified membership data to Firestore
            await saveMembershipToFirestore({
              status: "payment_verified",
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
            });

            setPaymentStatus("success");
            setSubmitted(true);
          } catch (error) {
            setPaymentStatus("idle");

            setPaymentError(
              error.message ||
                "भुगतान की पुष्टि में समस्या आई।"
            );
          }
        },
      });

      checkout.on("payment.failed", (response) => {
        setPaymentStatus("idle");

        setPaymentError(
          response.error?.description ||
            "भुगतान पूरा नहीं हुआ। कृपया दोबारा प्रयास करें।"
        );
      });

      checkout.open();
    } catch (error) {
      setPaymentStatus("idle");

      setPaymentError(
        error.message ||
          "भुगतान शुरू नहीं हो सका। कृपया बाद में प्रयास करें।"
      );
    }
  };

  /* =======================================================
     UI
     ======================================================= */

  return (
    <main className="min-h-screen bg-[#fbf7ef] text-[#43231f]">

      {/* ===== Success Popup Modal ===== */}
      {submitted && paymentStatus === "success" && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="success-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm"
        >
          <div className="relative w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
            {/* Close button */}
            <button
              onClick={() => {
                setSubmitted(false);
                setForm(initialForm);
                setAmount("100");
                setPaymentStatus("idle");
              }}
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
                id="success-modal-title"
                className="text-2xl font-bold text-[#2d6a2d]"
              >
                आवेदन सफल रहा!
              </h2>

              <p className="mt-3 text-base font-semibold text-[#43231f]">
                नमस्ते, <span className="text-[#7b1b26]">{form.name || "सदस्य"}</span> जी 🙏
              </p>

              <p className="mt-2 text-sm leading-7 text-[#806f62]">
                आपका सदस्यता आवेदन सफलतापूर्वक दर्ज हो गया है।
                मंदिर प्रशासन शीघ्र ही आपसे संपर्क करेगा।
              </p>

              {/* Amount badge */}
              <div className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#f0faf0] px-5 py-3">
                <CheckCircle2 size={20} className="text-[#2d6a2d]" />
                <span className="text-sm font-bold text-[#2d6a2d]">
                  ₹{amount} का आवेदन दर्ज हुआ
                </span>
              </div>

              <p className="mt-4 text-xs text-[#968475]">
                मो. {form.mobile}
                {form.email ? ` • ${form.email}` : ""}
              </p>
            </div>

            {/* Action button */}
            <button
              onClick={() => {
                setSubmitted(false);
                setForm(initialForm);
                setAmount("100");
                setPaymentStatus("idle");
              }}
              className="mt-7 w-full rounded-xl bg-[#7b1b26] py-3 font-bold text-white transition hover:bg-[#5f111c]"
            >
              ठीक है, धन्यवाद
            </button>
          </div>
        </div>
      )}

      {/* Hero Section */}

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

            <h1 className="mt-4 text-3xl font-bold leading-tight text-[#fff5e4] sm:text-5xl">
              मंदिर सदस्यता
            </h1>

            <p className="mt-5 max-w-xl text-base leading-8 text-[#f2dfce]">
              श्री कैलाश धाम मंदिर से जुड़ने और मंदिर की
              गतिविधियों में सहभागिता के लिए सदस्यता हेतु आवेदन करें।
            </p>

            <p className="mt-4 text-sm leading-7 text-[#e8c77f]">
              सदस्यता शुल्क न्यूनतम ₹100 है। आप अपनी इच्छानुसार
              अधिक राशि भी दे सकते हैं।
            </p>
          </div>

          <div className="rounded-3xl border border-[#e8c77f]/30 bg-white/5 p-6 sm:p-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e8bd69]/15 text-[#e8c77f]">
              <BadgeCheck size={30} />
            </div>

            <h2 className="mt-5 text-xl font-bold text-[#fff5e4]">
              सदस्य बनने की प्रक्रिया
            </h2>

            <div className="mt-5 space-y-4">
              {[
                "अपना आवेदन विवरण और सदस्यता राशि भरें।",
                "Razorpay के माध्यम से भुगतान करें।",
                "भुगतान सत्यापन के बाद आवेदन की स्थिति जाँचें।",
              ].map((item, index) => (
                <div key={item} className="flex items-start gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#e8c77f]/40 text-sm font-bold text-[#e8c77f]">
                    {index + 1}
                  </span>

                  <p className="pt-1 text-sm leading-6 text-[#f2dfce]">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="h-1 bg-gradient-to-r from-[#95612c] via-[#f0d18b] to-[#95612c]" />
      </section>

      {/* Membership Form */}

      <section className="mx-auto grid max-w-7xl items-start gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:px-8">
        <form
          onSubmit={handleSubmit}
          noValidate
          className="rounded-2xl border border-[#e8ddca] bg-white p-5 sm:p-8"
        >
          <div className="mb-6 flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#f6ecd9] text-[#8c5b25]">
              <UserRound size={25} />
            </span>

            <div>
              <h2 className="text-xl font-bold sm:text-2xl">
                सदस्यता आवेदन
              </h2>

              <p className="mt-1 text-sm text-[#806f62]">
                सभी आवश्यक विवरण भरें।
              </p>
            </div>
          </div>

          {/* Name */}

          <div className="space-y-5">
            <div>
              <label
                htmlFor="member-name"
                className="mb-2 block text-sm font-semibold"
              >
                पूरा नाम <span className="text-red-600">*</span>
              </label>

              <div className="relative">
                <UserRound
                  size={17}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#968475]"
                />

                <input
                  id="member-name"
                  autoComplete="name"
                  value={form.name}
                  onChange={(event) =>
                    update("name", event.target.value)
                  }
                  placeholder="अपना पूरा नाम दर्ज करें"
                  className={`${fieldClass} pl-10`}
                />
              </div>

              {errors.name && (
                <p className="mt-1 text-xs text-red-700">
                  {errors.name}
                </p>
              )}
            </div>

            {/* Mobile */}

            <div>
              <label
                htmlFor="member-mobile"
                className="mb-2 block text-sm font-semibold"
              >
                मोबाइल नंबर <span className="text-red-600">*</span>
              </label>

              <div className="relative">
                <Phone
                  size={17}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#968475]"
                />

                <input
                  id="member-mobile"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel-national"
                  maxLength={10}
                  value={form.mobile}
                  onChange={(event) =>
                    update(
                      "mobile",
                      event.target.value
                        .replace(/\D/g, "")
                        .slice(0, 10)
                    )
                  }
                  placeholder="10 अंकों का मोबाइल नंबर"
                  className={`${fieldClass} pl-10`}
                />
              </div>

              {errors.mobile && (
                <p className="mt-1 text-xs text-red-700">
                  {errors.mobile}
                </p>
              )}
            </div>

            {/* Email */}

            <div>
              <label
                htmlFor="member-email"
                className="mb-2 block text-sm font-semibold"
              >
                ईमेल पता{" "}
                <span className="text-[#968475]">(वैकल्पिक)</span>
              </label>

              <input
                id="member-email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={(event) =>
                  update("email", event.target.value)
                }
                placeholder="name@example.com"
                className={fieldClass}
              />

              {errors.email && (
                <p className="mt-1 text-xs text-red-700">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Address */}

            <div>
              <label
                htmlFor="member-address"
                className="mb-2 block text-sm font-semibold"
              >
                पूरा पता <span className="text-red-600">*</span>
              </label>

              <textarea
                id="member-address"
                rows={3}
                maxLength={500}
                autoComplete="street-address"
                value={form.address}
                onChange={(event) =>
                  update("address", event.target.value)
                }
                placeholder="ग्राम/शहर, जिला, राज्य और पिन कोड"
                className={`${fieldClass} resize-y`}
              />

              {errors.address && (
                <p className="mt-1 text-xs text-red-700">
                  {errors.address}
                </p>
              )}
            </div>

            {/* Membership Amount */}

            <div>
              <label
                htmlFor="membership-amount"
                className="mb-2 block text-sm font-semibold"
              >
                सदस्यता शुल्क (₹){" "}
                <span className="text-red-600">*</span>
              </label>

              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-semibold text-[#8c5b25]">
                  ₹
                </span>

                <input
                  id="membership-amount"
                  type="number"
                  min="100"
                  step="1"
                  inputMode="numeric"
                  required
                  value={amount}
                  onChange={(event) => {
                    setAmount(event.target.value);
                    setErrors((previous) => ({
                      ...previous,
                      amount: "",
                    }));
                    setPaymentError("");
                  }}
                  placeholder="न्यूनतम 100"
                  className={`${fieldClass} pl-9`}
                />
              </div>

              {errors.amount && (
                <p className="mt-1 text-xs text-red-700">
                  {errors.amount}
                </p>
              )}

              <p className="mt-2 text-xs leading-6 text-[#806f62]">
                न्यूनतम सदस्यता शुल्क ₹100 है। आप अपनी इच्छानुसार
                अधिक राशि भी दे सकते हैं।
              </p>
            </div>
          </div>

          {/* Payment Error */}

          {paymentError && (
            <div
              role="alert"
              className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700"
            >
              {paymentError}
            </div>
          )}

          {/* Payment Information */}

          <div className="mt-6 rounded-xl bg-[#fbf7ef] p-4">
            <p className="flex items-start gap-2 text-xs leading-6 text-[#806f62]">
              <Info
                size={17}
                className="mt-0.5 shrink-0 text-[#9a642a]"
              />

              न्यूनतम सदस्यता शुल्क ₹100 है। भुगतान की पुष्टि सर्वर
              द्वारा की जाएगी। सदस्यता की स्वीकृति मंदिर प्रशासन
              की नीति के अनुसार होगी।
            </p>
          </div>

          {/* Submit / Payment Button */}

          <button
            type="submit"
            disabled={
              paymentStatus === "processing" ||
              paymentStatus === "verifying" ||
              paymentStatus === "success"
            }
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#7b1b26] px-5 py-3.5 font-bold text-white transition hover:bg-[#5f111c] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {paymentStatus === "processing"
              ? "भुगतान तैयार हो रहा है..."
              : paymentStatus === "verifying"
                ? "भुगतान की पुष्टि हो रही है..."
                : paymentStatus === "success"
                  ? "भुगतान सत्यापित"
                  : `₹${amount || "0"} का भुगतान करें`}

            {paymentStatus !== "success" && (
              <ArrowRight size={18} />
            )}
          </button>
        </form>

        {/* Sidebar */}

        <aside className="space-y-5">
          <div className="rounded-2xl border border-[#e8ddca] bg-white p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#f6ecd9] text-[#8c5b25]">
              <Users size={25} />
            </div>

            <h2 className="mt-4 text-xl font-bold">
              सदस्यता से जुड़ें
            </h2>

            <p className="mt-3 text-sm leading-7 text-[#806f62]">
              मंदिर की गतिविधियों से जुड़े रहने और सहभागिता के
              अवसरों की जानकारी प्राप्त करने के लिए आवेदन करें।
            </p>

            <div className="mt-5 border-t border-[#eee3d3] pt-4">
              <p className="text-sm text-[#806f62]">
                न्यूनतम सदस्यता शुल्क
              </p>

              <p className="mt-1 text-3xl font-bold text-[#7b1b26]">
                ₹100
              </p>

              <p className="mt-1 text-xs text-[#806f62]">
                इच्छानुसार अधिक राशि का भुगतान कर सकते हैं।
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-[#4b111d] p-6 text-[#fff5e4]">
            <HandHeart size={28} className="text-[#e8c77f]" />

            <h2 className="mt-4 text-lg font-bold">
              सेवा और सहभागिता
            </h2>

            <p className="mt-3 text-sm leading-7 text-[#f2dfce]">
              सदस्यता की शर्तें, लाभ और स्वीकृति की प्रक्रिया
              मंदिर प्रशासन की अनुमोदित नीति के अनुसार होगी।
            </p>
          </div>

          <div className="rounded-2xl border border-[#ead9b7] bg-[#fff4dd] p-5">
            <p className="flex items-start gap-2 text-sm leading-7 text-[#765d47]">
              <LockKeyhole
                size={18}
                className="mt-1 shrink-0 text-[#8c5b25]"
              />

              भुगतान की पुष्टि केवल सर्वर द्वारा सफल सत्यापन के
              बाद ही स्वीकार की जाएगी।
            </p>
          </div>
        </aside>
      </section>
    </main>
  );
}
