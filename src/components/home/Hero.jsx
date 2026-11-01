import {
  ArrowRight,
  CalendarDays,
  Heart,
  MapPin,
  Play,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";

function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-[var(--color-cream)]">
      {/* =================================================
          BACKGROUND DECORATION
          ================================================= */}

      <div
        className="pointer-events-none absolute -right-40 -top-40 h-96 w-96 rounded-full bg-[var(--color-gold)]/10 blur-3xl"
        aria-hidden="true"
      />

      <div
        className="pointer-events-none absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-[var(--color-saffron)]/10 blur-3xl"
        aria-hidden="true"
      />

      {/* Subtle mandala-style decoration */}
      <div
        className="pointer-events-none absolute left-[-180px] top-1/2 hidden h-[420px] w-[420px] -translate-y-1/2 rounded-full border border-[var(--color-gold)]/10 lg:block"
        aria-hidden="true"
      />

      <div
        className="pointer-events-none absolute left-[-155px] top-1/2 hidden h-[370px] w-[370px] -translate-y-1/2 rounded-full border border-[var(--color-gold)]/10 lg:block"
        aria-hidden="true"
      />

      {/* =================================================
          MAIN HERO
          ================================================= */}

      <div className="mx-auto max-w-[var(--container-width)] px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 py-12 sm:py-14 lg:min-h-[calc(100vh-95px)] lg:grid-cols-[0.92fr_1.08fr] lg:gap-14 lg:py-16 xl:gap-20">
          {/* =================================================
              LEFT — MAIN MESSAGE
              ================================================= */}

          <div className="relative z-10 max-w-2xl">
            {/* Location */}
            <div className="animate-fade-up inline-flex max-w-full items-center gap-2 rounded-full border border-[var(--color-gold)]/30 bg-white/75 px-3.5 py-2 text-xs font-semibold text-[var(--color-maroon)] shadow-[var(--shadow-sm)] backdrop-blur-sm sm:px-4 sm:text-sm">
              <MapPin
                size={15}
                className="shrink-0 text-[var(--color-saffron)]"
                aria-hidden="true"
              />

              <span className="truncate">
                खटंगिया, दौना रोड जसरा प्रयागराज उ० प्र०
              </span>
            </div>

            {/* Devotional identity */}
            <div className="animate-fade-up mt-7 flex items-center gap-3">
              <span className="font-serif text-2xl text-[var(--color-gold)]">
                ॐ
              </span>

              <span className="h-px w-10 bg-[var(--color-gold)] sm:w-12" />

              <span className="text-[10px] font-semibold tracking-[0.18em] text-[var(--color-maroon)] sm:text-xs">
                शिव • साधना • संस्कार
              </span>
            </div>

            {/* Main heading */}
            <h1 className="heading-display animate-fade-up mt-4 text-4xl leading-[1.12] text-[var(--color-maroon)] sm:text-5xl md:text-6xl lg:text-[4rem] xl:text-[4.4rem]">
              दिव्य ज्योति लिंगेश्वर
              <span className="block text-[var(--color-saffron)]">
                 पंचतल महादेव मन्दिर
              </span>
            </h1>

            {/* Decorative divider */}
            <div className="animate-fade-up mt-6 flex items-center gap-3">
              <span className="h-px w-10 bg-[var(--color-gold)] sm:w-12" />

              <Sparkles
                size={16}
                className="text-[var(--color-gold)]"
                aria-hidden="true"
              />

              <span className="h-px w-16 bg-[var(--color-gold)] sm:w-20" />
            </div>

            {/* Subtitle */}
            <p className="animate-fade-up mt-6 max-w-xl text-lg font-medium leading-8 text-[var(--color-ink)] sm:text-xl">
              आस्था, भक्ति और सनातन परंपरा का पावन धाम।
            </p>

            <p className="animate-fade-up mt-3 max-w-xl text-sm leading-7 text-[var(--color-ink-light)] sm:text-base lg:text-lg">
              भगवान शिव की पावन भूमि से जुड़ें और पूजा, अनुष्ठान,
              दर्शन एवं धार्मिक सेवाओं का लाभ प्राप्त करें।
            </p>

            {/* =================================================
                ACTION BUTTONS
                ================================================= */}

            <div className="animate-fade-up mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/membership"
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-[var(--color-maroon)] px-6 py-3.5 text-sm font-bold text-[var(--color-cream)] shadow-[0_10px_25px_rgba(107,31,42,0.18)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[var(--color-maroon-dark)] hover:shadow-[0_14px_30px_rgba(107,31,42,0.25)] sm:px-7"
              >
                <CalendarDays
                  size={18}
                  className="!text-[var(--color-cream)]"
                  aria-hidden="true"
                />

                <span className="!text-[var(--color-cream)]">
                  पंजीकरण करें
                </span>

                <ArrowRight
                  size={16}
                  className="!text-[var(--color-cream)] transition-transform duration-300 group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </Link>

              <Link
                to="/donation"
                className="group inline-flex items-center justify-center gap-2 rounded-full border border-[var(--color-gold)] bg-white px-6 py-3.5 text-sm font-bold text-[var(--color-maroon)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[var(--color-gold)] hover:text-white sm:px-7"
              >
                <Heart
                  size={18}
                  strokeWidth={1.8}
                  aria-hidden="true"
                />

                <span>सेवा हेतु दान करें</span>
              </Link>
            </div>

            {/* =================================================
                QUICK FEATURES
                ================================================= */}

            <div className="animate-fade-up mt-8 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm text-[var(--color-muted)]">
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[var(--color-gold)]" />
                धार्मिक सेवाएँ
              </span>

              <span className="hidden h-4 w-px bg-[var(--color-border)] sm:block" />

              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[var(--color-gold)]" />
                ऑनलाइन पंजीकरण
              </span>

              <span className="hidden h-4 w-px bg-[var(--color-border)] sm:block" />

              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[var(--color-gold)]" />
                लाइव दर्शन
              </span>
            </div>
          </div>

          {/* =================================================
              RIGHT — TEMPLE VISUAL + MANTRA
              ================================================= */}

          <div className="relative z-10 w-full">
            {/* =================================================
                TEMPLE IMAGE CARD
                ================================================= */}

            <div className="relative mx-auto w-full max-w-[620px]">
              {/* Outer decorative frame */}
              <div
                className="pointer-events-none absolute -inset-3 hidden border border-[var(--color-gold)]/20 lg:block"
                aria-hidden="true"
              />

              <div
                className="pointer-events-none absolute -inset-6 hidden border border-[var(--color-gold)]/10 lg:block"
                aria-hidden="true"
              />

              {/* Main image card */}
              <div className="relative overflow-hidden rounded-[1.5rem] border border-[var(--color-gold)]/40 bg-[var(--color-maroon)] p-1.5 shadow-[0_25px_70px_rgba(61,31,25,0.18)] sm:rounded-[1.75rem] sm:p-2 lg:rounded-[2rem]">
                <div className="relative aspect-[4/3] overflow-hidden rounded-[1.15rem] sm:rounded-[1.35rem]">
                  <img
                    src="/images/temple/temple-main.jpg"
                    alt="श्री कैलाश धाम मंदिर"
                    className="h-full w-full object-cover transition-transform duration-700 hover:scale-[1.025]"
                  />

                  {/* Image overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#321016]/85 via-transparent to-[#321016]/5" />

                  {/* Top label */}
                  <div className="absolute left-4 top-4 sm:left-6 sm:top-6">
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-[#321016]/35 px-3 py-2 text-xs font-medium text-white backdrop-blur-md">
                      <span className="text-[var(--color-gold-light)]">
                        ॐ
                      </span>

                      <span>पावन धाम</span>
                    </div>
                  </div>

                  {/* Temple information */}
                  <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-7">
                    <div className="flex items-end justify-between gap-4">
                      <div>
                        <p className="text-[10px] font-semibold tracking-[0.2em] text-[var(--color-gold-light)] sm:text-xs">
                          श्री कैलाश धाम मंदिर
                        </p>

                        <h2 className="mt-1 font-serif text-2xl text-white sm:text-3xl lg:text-4xl">
                          आस्था • भक्ति • संस्कार
                        </h2>

                        <div className="mt-3 flex items-center gap-2 text-xs text-white/80 sm:text-sm">
                          <MapPin
                            size={14}
                            className="text-[var(--color-gold-light)]"
                          />

                          <span>खटंगिया, दौना रोड जसरा प्रयागराज उ० प्र०</span>
                        </div>
                      </div>

                      <Link
                        to="/about"
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/30 bg-black/20 !text-white backdrop-blur-md transition-all duration-300 hover:border-white/60 hover:bg-white/15 sm:h-11 sm:w-11"
                        aria-label="मंदिर के बारे में जानें"
                      >
                        <ArrowRight size={18} />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* =================================================
                MAHAMRITYUNJAYA MANTRA CARD
                ================================================= */}

            <div className="relative mx-auto mt-5 w-full max-w-[570px]">
              <div className="relative overflow-hidden border border-[var(--color-gold)]/40 bg-[#fffaf0] p-5 shadow-[0_15px_40px_rgba(61,31,25,0.10)] sm:p-6">
                {/* Decorative corner */}
                <div
                  className="absolute right-0 top-0 h-16 w-16 border-l border-b border-[var(--color-gold)]/20"
                  aria-hidden="true"
                />

                <div className="flex items-start gap-4 sm:gap-5">
                  {/* Om */}
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[var(--color-gold)]/60 bg-[var(--color-cream)] sm:h-12 sm:w-12">
                    <span className="font-serif text-xl text-[var(--color-maroon)]">
                      ॐ
                    </span>
                  </div>

                  <div className="min-w-0">
                    <p className="text-[10px] font-bold tracking-[0.18em] text-[var(--color-saffron)] sm:text-xs">
                      महामृत्युंजय मंत्र
                    </p>

                    <p className="mt-2 font-serif text-base leading-7 text-[var(--color-maroon)] sm:text-lg">
                      ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम् ।
                    </p>

                    <p className="font-serif text-base leading-7 text-[var(--color-maroon)] sm:text-lg">
                      उर्वारुकमिव बन्धनान् मृत्योर्मुक्षीय मामृतात् ॥
                    </p>
                  </div>
                </div>

                {/* Bottom ornament */}
                <div className="mt-5 flex items-center justify-center gap-3">
                  <span className="h-px w-10 bg-[var(--color-gold)]/50" />

                  <span className="font-serif text-sm text-[var(--color-gold)]">
                    ॐ
                  </span>

                  <span className="h-px w-10 bg-[var(--color-gold)]/50" />
                </div>
              </div>
            </div>

            {/* =================================================
                LIVE DARSHAN CARD
                ================================================= */}

            <Link
              to="/live"
              className="group relative mx-auto mt-4 flex w-full max-w-[570px] items-center justify-between gap-4 rounded-2xl border border-[var(--color-border)] bg-white p-4 shadow-[var(--shadow-md)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow-lg)] sm:p-5"
            >
              <div className="flex items-center gap-3">
                <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50">
                  <span className="absolute h-3 w-3 animate-ping rounded-full bg-red-500/30" />

                  <span className="relative h-2.5 w-2.5 rounded-full bg-red-600" />
                </span>

                <div>
                  <p className="text-xs font-medium text-[var(--color-muted)]">
                    अभी जुड़ें
                  </p>

                  <p className="mt-0.5 text-sm font-bold text-[var(--color-maroon)] sm:text-base">
                    लाइव दर्शन
                  </p>
                </div>
              </div>

              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-maroon)] text-white transition-transform duration-300 group-hover:translate-x-1">
                <Play
                  size={15}
                  fill="currentColor"
                  aria-hidden="true"
                />
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* =================================================
          BOTTOM DECORATIVE DIVIDER
          ================================================= */}

      <div className="relative mt-12 h-12 sm:mt-16">
        <div className="absolute left-0 right-0 top-1/2 h-px bg-[var(--color-gold)]/30" />

        <div className="absolute left-1/2 top-1/2 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 rotate-45 items-center justify-center border border-[var(--color-gold)] bg-[var(--color-cream)]">
          <div className="h-2.5 w-2.5 border border-[var(--color-saffron)]" />
        </div>
      </div>
    </section>
  );
}

export default Hero;