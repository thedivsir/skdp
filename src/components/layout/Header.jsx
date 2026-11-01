import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import {
  ArrowRight,
  ChevronDown,
  ChevronRight,
  Flower2,
  Heart,
  House,
  Images,
  Landmark,
  Menu,
  Radio,
  X,
} from "lucide-react";

/* =========================================================
   मुख्य नेविगेशन
   ========================================================= */


const navigationItems = [
  {
    label: "मुख्य पृष्ठ",
    path: "/",
    icon: House,
  },
  {
    label: "मंदिर परिचय",
    path: "/about",
    icon: Landmark,
  },
  {
    label: "पूजा एवं अनुष्ठान",
    path: "/rituals",
    icon: Flower2,
  },
  {
    label: "सेवाएँ एवं योजनाएँ",
    path: "#",
    submenu: [
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
        label: "मंदिर भ्रमण",
        path: "/tourism",
      },
    ],
  },
  {
    label: "पंजीकरण",
    path: "#",
    submenu: [
      {
        label: "सदस्यता पंजीकरण",
        path: "/membership",
      },
      {
        label: "मंदिर भ्रमण टिकट बुकिंग",
        path: "/tourism/ticket",
      },
      {
        label: "धार्मिक कार्यक्रम पंजीकरण",
        path: "/registration",
      },
      {
        label: "रोज़गार प्रशिक्षण पंजीकरण",
        path: "/rojgaar-prashikshan/panjikaran",
      },
      {
        label: "खेल भारती पंजीकरण",
        path: "/khel-bhaarti-school-game-pariyojna/panjikaran",
      },
      {
        label: "प्रॉपर्टी डीलरशिप पंजीकरण",
        path: "/property-dealership/panjikaran",
      },
      {
        label: "माला एवं कवच सेवा पंजीकरण",
        path: "/mala-kavach-seva/panjikaran",
      },
    ],
  },
  {
    label: "गैलरी",
    path: "/gallery",
    icon: Images,
  },
];


/* =========================================================
   Header
   ========================================================= */

function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDesktopMenu, setOpenDesktopMenu] = useState(null);
  const [openMobileMenu, setOpenMobileMenu] = useState(null);

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    setOpenMobileMenu(null);
  };

  const toggleMobileSubmenu = (label) => {
    setOpenMobileMenu((current) =>
      current === label ? null : label
    );
  };

  const handleDesktopMenuEnter = (label) => {
    setOpenDesktopMenu(label);
  };

  const handleDesktopMenuLeave = () => {
    setOpenDesktopMenu(null);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--color-gold)]/30 bg-[var(--color-cream)]/95 shadow-[0_4px_18px_rgba(43,33,28,0.07)] backdrop-blur-xl">
      {/* =====================================================
          मुख्य हेडर
      ===================================================== */}

      <div className="mx-auto max-w-[var(--container-width)] px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-[68px] items-center justify-between gap-4 lg:min-h-[72px]">

          {/* =================================================
              लोगो + मंदिर नाम
          ================================================= */}

          <Link
            to="/"
            onClick={closeMobileMenu}
            className="group flex min-w-0 shrink-0 items-center gap-2.5"
            aria-label="श्री कैलाश धाम मंदिर - मुख्य पृष्ठ"
          >
            {/* Logo */}
            <div className="relative flex h-[48px] w-[48px] shrink-0 items-center justify-center sm:h-[52px] sm:w-[52px]">
              {/* subtle decorative halo */}
              <span
                className="absolute inset-0 rounded-full border border-[var(--color-gold)]/25"
                aria-hidden="true"
              />

              <img
                src="/images/logo/logo.png"
                alt="श्री कैलाश धाम मंदिर"
                className="relative z-10 h-full w-full object-contain"
              />
            </div>

            {/* Temple Name */}
            <div className="min-w-0">
              <h1 className="heading-section whitespace-nowrap text-[17px] font-semibold leading-tight text-[var(--color-maroon)] transition-colors duration-300 group-hover:text-[var(--color-saffron)] sm:text-[20px]">
                श्री कैलाश धाम मंदिर
              </h1>

              {/* छोटा स्वर्ण अलंकरण */}
              <div
                className="mt-1 flex items-center gap-1.5"
                aria-hidden="true"
              >
                <span className="h-px w-7 bg-[var(--color-gold)]/70" />

                <span className="h-1.5 w-1.5 rotate-45 border border-[var(--color-gold)] bg-[var(--color-cream)]" />

                <span className="h-px w-3 bg-[var(--color-gold)]/50" />

                <span className="h-1 w-1 rounded-full bg-[var(--color-saffron)]" />

                <span className="h-px w-3 bg-[var(--color-gold)]/50" />

                <span className="h-1.5 w-1.5 rotate-45 border border-[var(--color-gold)] bg-[var(--color-cream)]" />

                <span className="h-px w-7 bg-[var(--color-gold)]/70" />
              </div>
            </div>
          </Link>

          {/* =================================================
              DESKTOP NAVIGATION
          ================================================= */}

          <nav
            className="hidden flex-1 items-center justify-center xl:flex"
            aria-label="मुख्य नेविगेशन"
          >
            <div className="flex items-center">

              {navigationItems.map((item) => {
                const hasSubmenu = Boolean(item.submenu);

                /* ---------------------------------------------
                   Dropdown item
                --------------------------------------------- */

                if (hasSubmenu) {
                  return (
                    <div
                      key={item.label}
                      className="relative"
                      onMouseEnter={() =>
                        handleDesktopMenuEnter(item.label)
                      }
                      onMouseLeave={handleDesktopMenuLeave}
                    >
                      <button
                        type="button"
                        className={[
                          "group relative flex h-[68px] items-center gap-1.5 px-3 text-[13px] font-semibold text-[var(--color-ink-light)] transition-colors duration-200",
                          "hover:text-[var(--color-maroon)]",
                        ].join(" ")}
                        aria-expanded={
                          openDesktopMenu === item.label
                        }
                        aria-haspopup="true"
                      >
                        <span className="whitespace-nowrap">
                          {item.label}
                        </span>

                        <ChevronDown
                          size={14}
                          strokeWidth={1.9}
                          className={`transition-transform duration-200 ${
                            openDesktopMenu === item.label
                              ? "rotate-180 text-[var(--color-maroon)]"
                              : ""
                          }`}
                          aria-hidden="true"
                        />

                        {/* hover / active decorative line */}
                        <span
                          className={[
                            "absolute bottom-[10px] left-3 right-3 h-[2px] origin-center rounded-full bg-[var(--color-gold)] transition-transform duration-200",
                            openDesktopMenu === item.label
                              ? "scale-x-100"
                              : "scale-x-0 group-hover:scale-x-100",
                          ].join(" ")}
                          aria-hidden="true"
                        />
                      </button>

                      {/* ---------------------------------------
                          Desktop Submenu
                      --------------------------------------- */}

                      {openDesktopMenu === item.label && (
                        <div className="absolute left-1/2 top-[calc(100%-2px)] z-50 w-[290px] -translate-x-1/2 pt-2">
                          <div className="overflow-hidden rounded-xl border border-[var(--color-gold)]/30 bg-[var(--color-cream)] shadow-[0_18px_40px_rgba(43,33,28,0.16)]">

                            {/* submenu top decoration */}
                            <div
                              className="h-[3px] bg-gradient-to-r from-[var(--color-maroon)] via-[var(--color-gold)] to-[var(--color-maroon)]"
                              aria-hidden="true"
                            />

                            <div className="border-b border-[var(--color-gold)]/20 bg-[var(--color-maroon)] px-4 py-3">
                              <p className="text-xs font-bold tracking-wide text-[#fff4df]">
                                {item.label}
                              </p>
                            </div>

                            <div className="p-1.5">
                              {item.submenu.map((subItem) => (
                                <NavLink
                                  key={subItem.path}
                                  to={subItem.path}
                                  className={({ isActive }) =>
                                    [
                                      "group flex items-center justify-between rounded-lg px-3.5 py-3 text-[13px] font-medium transition-all duration-200",
                                      isActive
                                        ? "bg-[var(--color-maroon)]/8 text-[var(--color-maroon)]"
                                        : "text-[var(--color-ink-light)] hover:bg-[var(--color-gold)]/10 hover:text-[var(--color-maroon)]",
                                    ].join(" ")
                                  }
                                >
                                  <span>{subItem.label}</span>

                                  <ChevronRight
                                    size={14}
                                    className="opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-100"
                                    aria-hidden="true"
                                  />
                                </NavLink>
                              ))}
                            </div>

                            {/* submenu bottom ornament */}
                            <div
                              className="mx-5 mb-2 h-px bg-gradient-to-r from-transparent via-[var(--color-gold)]/50 to-transparent"
                              aria-hidden="true"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }

                /* ---------------------------------------------
                   Normal navigation item
                --------------------------------------------- */

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === "/"}
                    className={({ isActive }) =>
                      [
                        "group relative flex h-[68px] items-center gap-1.5 px-3 text-[13px] font-semibold transition-colors duration-200",
                        isActive
                          ? "text-[var(--color-maroon)]"
                          : "text-[var(--color-ink-light)] hover:text-[var(--color-maroon)]",
                      ].join(" ")
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {item.icon && (
                          <item.icon
                            size={16}
                            strokeWidth={isActive ? 2 : 1.8}
                            aria-hidden="true"
                          />
                        )}

                        <span className="whitespace-nowrap">
                          {item.label}
                        </span>

                        {/* active / hover line */}
                        <span
                          className={[
                            "absolute bottom-[10px] left-3 right-3 h-[2px] origin-center rounded-full bg-[var(--color-gold)] transition-transform duration-200",
                            isActive
                              ? "scale-x-100"
                              : "scale-x-0 group-hover:scale-x-100",
                          ].join(" ")}
                          aria-hidden="true"
                        />
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </nav>

          {/* =================================================
              DESKTOP ACTIONS
          ================================================= */}

          <div className="hidden shrink-0 items-center gap-2 xl:flex">

            {/* ---------------------------------------------
                Live Darshan
            --------------------------------------------- */}

            <Link
              to="/live"
              className="group inline-flex h-10 items-center gap-2 rounded-full border border-[var(--color-maroon)]/20 bg-white px-3.5 text-xs font-bold text-[var(--color-maroon)] transition-all duration-200 hover:border-[var(--color-maroon)]/35 hover:bg-[var(--color-cream)]"
            >
              {/* Blinking red live indicator */}
              <span className="relative flex h-2.5 w-2.5 items-center justify-center">
                <span
                  className="absolute h-2.5 w-2.5 animate-ping rounded-full bg-red-500/60"
                  aria-hidden="true"
                />

                <span
                  className="relative h-2 w-2 rounded-full bg-red-600"
                  aria-hidden="true"
                />
              </span>

              <Radio
                size={15}
                strokeWidth={2}
                aria-hidden="true"
              />

              <span>लाइव दर्शन</span>
            </Link>

            {/* ---------------------------------------------
                Donation
            --------------------------------------------- */}

            <Link
              to="/donation"
              className="group inline-flex h-10 items-center gap-1.5 rounded-full border border-[var(--color-gold)]/70 bg-[var(--color-maroon)] px-4 text-xs font-bold !text-[#fff4df] shadow-[0_7px_18px_rgba(107,31,42,0.18)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[var(--color-saffron)] hover:shadow-[0_10px_22px_rgba(107,31,42,0.24)]"
            >
              <Heart
                size={15}
                strokeWidth={1.9}
                className="!text-[#fff4df]"
                aria-hidden="true"
              />

              <span className="!text-[#fff4df]">
                दान करें
              </span>

              <ArrowRight
                size={14}
                className="!text-[#fff4df] transition-transform duration-200 group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
          </div>

          {/* =================================================
              MOBILE MENU BUTTON
          ================================================= */}

          <button
            type="button"
            onClick={() =>
              setMobileMenuOpen((value) => !value)
            }
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[var(--color-gold)]/40 bg-white text-[var(--color-maroon)] transition-colors hover:bg-[var(--color-gold)]/10 xl:hidden"
            aria-label={
              mobileMenuOpen
                ? "मेनू बंद करें"
                : "मेनू खोलें"
            }
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation"
          >
            {mobileMenuOpen ? (
              <X size={21} aria-hidden="true" />
            ) : (
              <Menu size={21} aria-hidden="true" />
            )}
          </button>
        </div>

        {/* =====================================================
            MOBILE NAVIGATION
        ===================================================== */}

        {mobileMenuOpen && (
          <div
            id="mobile-navigation"
            className="border-t border-[var(--color-gold)]/20 py-3 xl:hidden"
          >
            <nav
              className="space-y-1"
              aria-label="मोबाइल नेविगेशन"
            >
              {navigationItems.map((item) => {
                const hasSubmenu = Boolean(item.submenu);
                const isOpen =
                  openMobileMenu === item.label;

                if (hasSubmenu) {
                  return (
                    <div key={item.label}>
                      <button
                        type="button"
                        onClick={() =>
                          toggleMobileSubmenu(item.label)
                        }
                        className="flex min-h-11 w-full items-center justify-between rounded-lg px-3 text-sm font-semibold text-[var(--color-ink)] transition-colors hover:bg-white hover:text-[var(--color-maroon)]"
                        aria-expanded={isOpen}
                      >
                        <span>{item.label}</span>

                        <ChevronDown
                          size={17}
                          className={`transition-transform duration-200 ${
                            isOpen ? "rotate-180" : ""
                          }`}
                          aria-hidden="true"
                        />
                      </button>

                      {isOpen && (
                        <div className="ml-3 mt-1 border-l border-[var(--color-gold)]/35 pl-2">
                          {item.submenu.map((subItem) => (
                            <NavLink
                              key={subItem.path}
                              to={subItem.path}
                              onClick={closeMobileMenu}
                              className={({ isActive }) =>
                                [
                                  "flex items-center gap-2 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-colors",
                                  isActive
                                    ? "bg-[var(--color-gold)]/10 text-[var(--color-maroon)]"
                                    : "text-[var(--color-ink-light)] hover:bg-white hover:text-[var(--color-maroon)]",
                                ].join(" ")
                              }
                            >
                              <ChevronRight
                                size={14}
                                aria-hidden="true"
                              />

                              <span>{subItem.label}</span>
                            </NavLink>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === "/"}
                    onClick={closeMobileMenu}
                    className={({ isActive }) =>
                      [
                        "flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-semibold transition-colors",
                        isActive
                          ? "bg-[var(--color-maroon)] !text-white"
                          : "text-[var(--color-ink)] hover:bg-white hover:text-[var(--color-maroon)]",
                      ].join(" ")
                    }
                  >
                    {item.icon && (
                      <item.icon
                        size={17}
                        strokeWidth={1.8}
                        aria-hidden="true"
                      />
                    )}

                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>

            {/* =================================================
                MOBILE ACTIONS
            ================================================= */}

            <div className="mt-3 grid grid-cols-2 gap-2 border-t border-[var(--color-gold)]/20 pt-3">

              {/* Live */}
              <Link
                to="/live"
                onClick={closeMobileMenu}
                className="flex h-11 items-center justify-center gap-2 rounded-lg border border-[var(--color-maroon)]/15 bg-white text-sm font-bold text-[var(--color-maroon)]"
              >
                <span className="relative flex h-2.5 w-2.5 items-center justify-center">
                  <span
                    className="absolute h-2.5 w-2.5 animate-ping rounded-full bg-red-500/60"
                    aria-hidden="true"
                  />

                  <span
                    className="relative h-2 w-2 rounded-full bg-red-600"
                    aria-hidden="true"
                  />
                </span>

                <Radio size={16} aria-hidden="true" />

                <span>लाइव दर्शन</span>
              </Link>

              {/* Donation */}
              <Link
                to="/donation"
                onClick={closeMobileMenu}
                className="flex h-11 items-center justify-center gap-2 rounded-lg bg-[var(--color-maroon)] text-sm font-bold !text-[#fff4df] shadow-[var(--shadow-sm)] transition-colors hover:bg-[var(--color-saffron)]"
              >
                <Heart
                  size={16}
                  className="!text-[#fff4df]"
                  aria-hidden="true"
                />

                <span className="!text-[#fff4df]">
                  दान करें
                </span>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* =====================================================
          SIMPLE DECORATIVE BOTTOM LINE
      ===================================================== */}

      <div
        className="h-[2px] bg-gradient-to-r from-transparent via-[var(--color-gold)]/70 to-transparent"
        aria-hidden="true"
      />
    </header>
  );
}

export default Header;