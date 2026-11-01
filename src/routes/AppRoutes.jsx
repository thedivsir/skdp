
import { Link, Navigate, Route, Routes } from "react-router-dom";

import Home from "../pages/Home";
import Registration from "../pages/Registration";
import About from "../pages/About";
import Rituals from "../pages/Rituals";
import Gallery from "../pages/Gallery";
import MalaKavachSeva from "../pages/MalaKavachSeva";
import LiveDarshan from "../pages/LiveDarshan";
import Donation from "../pages/Donation";
import Tourism from "../pages/Tourism";
import TourTicket from "../pages/TourTicket";
import Membership from "../pages/Membership";
import Admin from "../pages/Admin";

import RegistrationTabs from "../components/registration/RegistrationTabs";

/* =========================================================
   पंजीकरण पृष्ठों का साझा टैब लेआउट
   ========================================================= */

function RegistrationLayout({ children }) {
  return (
    <>
      <RegistrationTabs />
      {children}
    </>
  );
}

/* =========================================================
   अस्थायी पृष्ठ
   ========================================================= */

function ComingSoonPage({ title, description }) {
  return (
    <section className="flex min-h-[65vh] items-center justify-center bg-[var(--color-cream)] px-5 py-20">
      <div className="max-w-2xl text-center">
        <div
          className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-[var(--color-gold)]/40 bg-white text-[var(--color-maroon)] shadow-sm"
          aria-hidden="true"
        >
          ॐ
        </div>

        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-gold-dark)]">
          श्री कैलाश धाम मंदिर
        </p>

        <h1 className="mt-3 text-3xl font-bold text-[var(--color-maroon)] sm:text-4xl">
          {title}
        </h1>

        <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[var(--color-ink-light)] sm:text-base">
          {description}
        </p>

        <div className="mx-auto mt-7 h-px w-24 bg-[var(--color-gold)]/60" />
      </div>
    </section>
  );
}

/* =========================================================
   404 पृष्ठ
   ========================================================= */

function NotFoundPage() {
  return (
    <section className="flex min-h-[65vh] items-center justify-center bg-[var(--color-cream)] px-5 py-20">
      <div className="max-w-xl text-center">
        <p className="text-sm font-semibold tracking-widest text-[var(--color-gold-dark)]">
          404
        </p>

        <h1 className="mt-2 text-4xl font-bold text-[var(--color-maroon)] sm:text-5xl">
          पृष्ठ नहीं मिला
        </h1>

        <p className="mt-4 text-sm leading-7 text-[var(--color-ink-light)] sm:text-base">
          आपके द्वारा खोजा गया पृष्ठ उपलब्ध नहीं है।
        </p>

        <Link
          to="/"
          className="mt-7 inline-flex items-center rounded-full bg-[var(--color-maroon)] px-5 py-3 text-sm font-bold !text-white transition-colors hover:bg-[var(--color-saffron)]"
        >
          मुख्य पृष्ठ पर जाएँ
        </Link>
      </div>
    </section>
  );
}

/* =========================================================
   App Routes
   ========================================================= */

function AppRoutes() {
  return (
    <Routes>
      {/* मुख्य पृष्ठ */}
      <Route path="/" element={<Home />} />

      {/* मंदिर परिचय */}
      <Route path="/about" element={<About />} />

      {/* पूजा एवं अनुष्ठान */}
      <Route path="/rituals" element={<Rituals />} />

      {/* धार्मिक कार्यक्रम पंजीकरण */}
      <Route
        path="/registration"
        element={
          <RegistrationLayout>
            <Registration />
          </RegistrationLayout>
        }
      />

      {/* गैलरी */}
      <Route path="/gallery" element={<Gallery />} />

      {/* =====================================================
          सेवाएँ एवं योजनाएँ
         ===================================================== */}

      <Route
        path="/rojgaar-prashikshan"
        element={
          <ComingSoonPage
            title="रोज़गार प्रशिक्षण"
            description="रोज़गार प्रशिक्षण से संबंधित जानकारी, प्रशिक्षण कार्यक्रम और सेवा विवरण जल्द उपलब्ध होंगे।"
          />
        }
      />

      <Route
        path="/khel-bhaarti-school-game-pariyojna"
        element={
          <ComingSoonPage
            title="खेल भारती स्कूल गेम योजना"
            description="योग, वॉलीबॉल, कबड्डी और क्रिकेट से संबंधित परियोजना की विस्तृत जानकारी जल्द उपलब्ध होगी।"
          />
        }
      />

      <Route
        path="/property-dealership"
        element={
          <ComingSoonPage
            title="प्रॉपर्टी डीलरशिप"
            description="प्रॉपर्टी डीलरशिप से संबंधित सेवाओं और प्रक्रिया की विस्तृत जानकारी जल्द उपलब्ध होगी।"
          />
        }
      />

      <Route
        path="/mala-kavach-seva"
        element={<MalaKavachSeva />}
      />

      {/* =====================================================
          पर्यटन एवं मंदिर भ्रमण
         ===================================================== */}

      <Route
        path="/tourism"
        element={<Tourism />}
      />

      {/* टूर टिकट बुकिंग: पंजीकरण टैब दिखाई देंगे */}
      <Route
        path="/tourism/ticket"
        element={
          <RegistrationLayout>
            <TourTicket />
          </RegistrationLayout>
        }
      />

      {/* =====================================================
          पंजीकरण
         ===================================================== */}

      <Route
        path="/rojgaar-prashikshan/panjikaran"
        element={
          <RegistrationLayout>
            <ComingSoonPage
              title="रोज़गार प्रशिक्षण पंजीकरण"
              description="रोज़गार प्रशिक्षण हेतु पंजीकरण फॉर्म जल्द उपलब्ध होगा।"
            />
          </RegistrationLayout>
        }
      />

      <Route
        path="/khel-bhaarti-school-game-pariyojna/panjikaran"
        element={
          <RegistrationLayout>
            <ComingSoonPage
              title="खेल भारती पंजीकरण"
              description="योग, वॉलीबॉल, कबड्डी और क्रिकेट के लिए पंजीकरण फॉर्म जल्द उपलब्ध होगा।"
            />
          </RegistrationLayout>
        }
      />

      <Route
        path="/property-dealership/panjikaran"
        element={
          <RegistrationLayout>
            <ComingSoonPage
              title="प्रॉपर्टी डीलरशिप पंजीकरण"
              description="प्रॉपर्टी डीलरशिप से संबंधित आवेदन फॉर्म जल्द उपलब्ध होगा।"
            />
          </RegistrationLayout>
        }
      />

      <Route
        path="/mala-kavach-seva/panjikaran"
        element={
          <RegistrationLayout>
            <ComingSoonPage
              title="माला एवं कवच सेवा पंजीकरण"
              description="माला एवं कवच सेवा हेतु सेवा अनुरोध फॉर्म जल्द उपलब्ध होगा।"
            />
          </RegistrationLayout>
        }
      />

      {/* सदस्यता पंजीकरण */}
      <Route
        path="/membership/panjikaran"
        element={
          <RegistrationLayout>
            <Membership />
          </RegistrationLayout>
        }
      />

     {/* सदस्यता पृष्ठ: पंजीकरण टैब के साथ */}
<Route
  path="/membership"
  element={
    <RegistrationLayout>
      <Membership />
    </RegistrationLayout>
  }
/>

      {/* =====================================================
          दान एवं लाइव दर्शन
         ===================================================== */}

      <Route
        path="/donation"
        element={<Donation />}
      />

      <Route
        path="/live"
        element={<LiveDarshan />}
      />

      {/* =====================================================
          गोपनीयता नीति एवं नियम
         ===================================================== */}

      <Route
        path="/privacy"
        element={
          <ComingSoonPage
            title="गोपनीयता नीति"
            description="गोपनीयता नीति का विस्तृत पृष्ठ जल्द उपलब्ध होगा।"
          />
        }
      />

      <Route
        path="/terms"
        element={
          <ComingSoonPage
            title="नियम एवं शर्तें"
            description="नियम एवं शर्तों का विस्तृत पृष्ठ जल्द उपलब्ध होगा।"
          />
        }
      />

      {/* व्यवस्थापक */}
      <Route
        path="/admin"
        element={<Admin />}
      />

      {/* /index.html से मुख्य पृष्ठ पर जाएँ */}
      <Route
        path="/index.html"
        element={<Navigate to="/" replace />}
      />

      {/* अज्ञात URL */}
      <Route
        path="*"
        element={<NotFoundPage />}
      />
    </Routes>
  );
}

export default AppRoutes;
