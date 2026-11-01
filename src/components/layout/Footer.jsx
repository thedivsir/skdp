import {
  ArrowUpRight,
  Heart,
  Landmark,
  MapPin,
  Phone,
} from "lucide-react";

import { Link } from "react-router-dom";
import { FaFacebookF, FaInstagram, FaYoutube } from "react-icons/fa";

/* =========================================================
   त्वरित लिंक
   ========================================================= */

const quickLinks = [
  { label: "मुख्य पृष्ठ", path: "/" },
  { label: "मंदिर परिचय", path: "/about" },
  { label: "पूजा एवं अनुष्ठान", path: "/rituals" },
  { label: "पंजीकरण", path: "/registration" },
  { label: "गैलरी", path: "/gallery" },
];

/* =========================================================
   सेवाएँ एवं योजनाएँ
   ========================================================= */

const serviceLinks = [
  {
    label: "रोज़गार प्रशिक्षण",
    path: "/rojgaar-prashikshan",
  },
  {
    label: "खेल भारती स्कूल गेम योजना",
    path: "/khel-bhaarti-school-game-pariyojna",
  },
  {
    label: "प्रॉपर्टी डीलरशिप",
    path: "/property-dealership",
  },
  {
    label: "माला एवं कवच सेवा",
    path: "/mala-kavach-seva",
  },
  {
    label: "सदस्यता",
    path: "/membership",
  },
];

/* =========================================================
   सोशल मीडिया
   ========================================================= */

const socialLinks = [
  {
    label: "यूट्यूब",
    href: "https://youtube.com/channel/UCrmOWmLYDjGkTdIeuAZq5QA?si=z9TJUM7jOwzvranm",
    icon: FaYoutube,
  },
  {
    label: "फेसबुक",
    href: "https://www.facebook.com/share/1MGRhYKjoU/",
    icon: FaFacebookF,
  },
  {
    label: "इंस्टाग्राम",
    href: "https://www.instagram.com/shreekailashdham.panchtal?stkn=cHZ6djJhdTQzbGt6",
    icon: FaInstagram,
  },
];

/* =========================================================
   संपर्क जानकारी
   ========================================================= */

const contactDetails = [
  {
    label: "मुख्य पुजारी - महंत",
    name: "पं. श्री सुशील पुजारी जी महाराज",
  },
];

/* =========================================================
   Footer
   ========================================================= */

function Footer() {
  return (
    <footer className="bg-[#4a1720] text-white">

      {/* =====================================================
          MAIN FOOTER
      ===================================================== */}

      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-6 lg:px-8 lg:py-16">

        <div className="grid gap-12 lg:grid-cols-[1.35fr_0.8fr_1fr_1fr]">

          {/* =================================================
              TEMPLE INFORMATION
          ================================================= */}

          <div>

            {/* Logo + Temple Name */}
            <Link
              to="/"
              className="inline-flex items-center gap-3"
              aria-label="श्री कैलाश धाम मंदिर - मुख्य पृष्ठ"
            >
              <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl border border-[#e4bb5b]/25 bg-[#fffaf2] p-2">
                <img
                  src="/images/logo/logo.png"
                  alt="श्री कैलाश धाम मंदिर"
                  className="h-full w-full object-contain"
                />
              </div>

              <div>
                <p className="text-lg font-bold text-[#fffaf2]">
                  श्री कैलाश धाम मंदिर
                </p>

                <p className="mt-0.5 text-xs text-[#f1dfbd]/55">
                  खटंगिया, दौना रोड, जसरा
                </p>
              </div>
            </Link>

            {/* Decorative line */}
            <div
              className="mt-5 flex items-center gap-2"
              aria-hidden="true"
            >
              <span className="h-px w-10 bg-[#e4bb5b]/60" />
              <span className="h-1.5 w-1.5 rotate-45 border border-[#e4bb5b]/70" />
              <span className="h-px w-16 bg-[#e4bb5b]/30" />
            </div>
            
            {/* =================================================
                FULL ADDRESS
            ================================================= */}

            <div className="mt-6 flex items-start gap-3">

              <MapPin
                size={19}
                className="mt-0.5 shrink-0 text-[#e4bb5b]"
                aria-hidden="true"
              />

              <div>
                <p className="text-sm font-semibold text-[#fffaf2]">
                  मंदिर का पता
                </p>

                <p className="mt-1 text-sm leading-6 text-[#f1dfbd]/60">
                  श्री कैलाश धाम मंदिर
                  <br />
                  खटंगिया, दौना रोड, जसरा
                  <br />
                  प्रयागराज, उत्तर प्रदेश
                  <br />
                  212107, भारत
                </p>
              </div>
            </div>

            {/* =================================================
                CONTACT
            ================================================= */}

            <div className="mt-6 space-y-3">

              {contactDetails.map((contact) => (
                <div
                  key={contact.phone}
                  className="flex items-start gap-3"
                >
                  <Phone
                    size={17}
                    className="mt-0.5 shrink-0 text-[#e4bb5b]"
                    aria-hidden="true"
                  />

                  <div className="min-w-0">
                    <p className="text-xs font-medium text-[#f1dfbd]/45">
                      {contact.label}
                    </p>

                    <p className="mt-0.5 text-sm font-semibold text-[#fffaf2]">
                      {contact.name}
                    </p>
                  </div>
                </div>
              ))}

            </div>

          </div>

          {/* =================================================
              QUICK LINKS
          ================================================= */}

          <div>

            <h3 className="text-base font-bold text-[#fffaf2]">
              त्वरित लिंक
            </h3>

            <div className="mt-5 space-y-3">

              {quickLinks.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="group flex items-center gap-2 text-sm text-[#f1dfbd]/55 transition-colors duration-200 hover:text-[#e4bb5b]"
                >
                  <ArrowUpRight
                    size={14}
                    className="opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-100"
                    aria-hidden="true"
                  />

                  <span>{item.label}</span>
                </Link>
              ))}

            </div>

          </div>

          {/* =================================================
              SERVICES & SCHEMES
          ================================================= */}

          <div>

            <h3 className="text-base font-bold text-[#fffaf2]">
              सेवाएँ एवं योजनाएँ
            </h3>

            <div className="mt-5 space-y-3">

              {serviceLinks.map((item) => (
                <Link
                  key={`${item.path}-${item.label}`}
                  to={item.path}
                  className="group flex items-start gap-2 text-sm leading-6 text-[#f1dfbd]/55 transition-colors duration-200 hover:text-[#e4bb5b]"
                >
                  <ArrowUpRight
                    size={14}
                    className="mt-1 shrink-0 opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-100"
                    aria-hidden="true"
                  />

                  <span>{item.label}</span>
                </Link>
              ))}

            </div>

          </div>

          {/* =================================================
              CONNECT / CTA
          ================================================= */}

          <div>

            <h3 className="text-base font-bold text-[#fffaf2]">
              मंदिर से जुड़े रहें
            </h3>

            <p className="mt-5 text-sm leading-7 text-[#f1dfbd]/55">
              मंदिर के दर्शन, धार्मिक सेवाओं और मंदिर से जुड़ी
              गतिविधियों की जानकारी के लिए हमारे सोशल मीडिया
              माध्यमों से जुड़े रहें।
            </p>

            {/* =================================================
                SOCIAL MEDIA
            ================================================= */}

            <div className="mt-5 flex items-center gap-2">

              {socialLinks.map((social) => {
                const Icon = social.icon;

                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-[#e4bb5b]/25 bg-[#fffaf2]/5 text-[#f1dfbd]/70 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#e4bb5b]/70 hover:bg-[#e4bb5b] hover:text-[#4a1720]"
                  >
                    <Icon
                      size={17}
                      aria-hidden="true"
                    />
                  </a>
                );
              })}

            </div>

            {/* =================================================
                DONATION CTA
            ================================================= */}

            <Link
              to="/donation"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#e4bb5b] px-5 py-3 font-semibold text-[#4a1720] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#f3d58a]"
            >
              <Heart
                size={17}
                aria-hidden="true"
              />

              <span>
                दान एवं सहयोग
              </span>

              <ArrowUpRight
                size={15}
                aria-hidden="true"
              />
            </Link>

            {/* =================================================
                LIVE DARSHAN
            ================================================= */}

            <Link
              to="/live"
              className="mt-4 flex items-center gap-2 text-sm font-semibold text-[#fffaf2] transition-colors duration-200 hover:text-[#e4bb5b]"
            >
              <span className="relative flex h-2.5 w-2.5 items-center justify-center">
                <span
                  className="absolute h-2.5 w-2.5 animate-ping rounded-full bg-red-500/50"
                  aria-hidden="true"
                />

                <span
                  className="relative h-2 w-2 rounded-full bg-red-500"
                  aria-hidden="true"
                />
              </span>

              <Landmark
                size={16}
                aria-hidden="true"
              />

              <span>
                लाइव दर्शन देखें
              </span>

              <ArrowUpRight
                size={15}
                aria-hidden="true"
              />
            </Link>

          </div>

        </div>

      </div>

      {/* =====================================================
          BOTTOM BAR
      ===================================================== */}

      <div className="border-t border-[#e4bb5b]/15">

        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-5 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">

          <p className="text-xs leading-6 text-[#f1dfbd]/40">
            © {new Date().getFullYear()} श्री कैलाश धाम मंदिर।
            सर्वाधिकार सुरक्षित।
          </p>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-[#f1dfbd]/40">

            <Link
              to="/privacy"
              className="transition-colors hover:text-[#e4bb5b]"
            >
              गोपनीयता नीति
            </Link>

            <Link
              to="/terms"
              className="transition-colors hover:text-[#e4bb5b]"
            >
              नियम एवं शर्तें
            </Link>

            <span
              className="text-[#f1dfbd]/20"
              aria-hidden="true"
            >
              |
            </span>

            <Link
              to="/admin"
              className="transition-colors hover:text-[#e4bb5b]"
            >
              प्रशासन पोर्टल
            </Link>

            <span
              className="text-[#f1dfbd]/20"
              aria-hidden="true"
            >
              |
            </span>

            <span>
              Powered by Srijan Parallel Computing
            </span>

          </div>

        </div>

      </div>

    </footer>
  );
}

export default Footer;