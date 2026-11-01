
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock3,
  MapPin,
  ShieldCheck,
  Sparkles,
  Ticket,
} from "lucide-react";

const floors = [
  {
    number: "भूमि तल",
    title: "Ground Floor",
    description: "मंदिर भ्रमण का प्रारंभिक स्तर।",
  },
  {
    number: "प्रथम तल",
    title: "First Floor",
    description: "मंदिर के भ्रमण मार्ग का अगला स्तर।",
  },
  {
    number: "द्वितीय तल",
    title: "Second Floor",
    description: "पंचतलीय मंदिर का तीसरा स्तर।",
  },
  {
    number: "तृतीय तल",
    title: "Third Floor",
    description: "मंदिर भ्रमण का चौथा स्तर।",
  },
  {
    number: "चतुर्थ तल",
    title: "Fourth Floor",
    description: "मंदिर के भ्रमण का पाँचवाँ और ऊपरी स्तर।",
  },
];

const benefits = [
  "एक टिकट में सभी पाँच स्तरों का भ्रमण",
  "भ्रमण से पहले आवश्यक दिशा-निर्देश",
  "तिथि और उपलब्धता के अनुसार टिकट अनुरोध",
];

export default function Tourism() {
  return (
    <main className="min-h-screen bg-[#fbf7ef] text-[#43231f]">
      <section className="relative overflow-hidden bg-[#4b111d]">
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-25"
          style={{
            backgroundImage:
              "radial-gradient(circle at 15% 20%, #e8bd69, transparent 32%), radial-gradient(circle at 90% 80%, #a65b39, transparent 30%)",
          }}
        />
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-2 lg:px-8">
          <div>
            <p className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-[#e8c77f]">
              <Sparkles size={17} /> आस्था और आध्यात्मिक अनुभव
            </p>
            <h1 className="text-3xl font-bold leading-tight text-[#fff5e4] sm:text-5xl">
              पर्यटन एवं मंदिर भ्रमण
            </h1>
            <p className="mt-5 max-w-xl text-base leading-8 text-[#f2dfce]">
              श्री कैलाश धाम मंदिर के पाँचों स्तरों का भ्रमण करने
              की योजना बनाएँ। अपनी यात्रा से पहले टिकट संबंधी
              जानकारी और मंदिर प्रशासन के दिशा-निर्देश प्राप्त करें।
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                to="/tourism/ticket"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#e8bd69] px-5 py-3 font-bold text-[#4b111d] transition hover:bg-[#f3d38c]"
              >
                <Ticket size={19} /> टूर टिकट बुक करें
                <ArrowRight size={18} />
              </Link>
              <a
                href="#floor-guide"
                className="inline-flex items-center justify-center rounded-xl border border-[#e8c77f]/50 px-5 py-3 font-semibold !text-[#fff5e4] transition hover:bg-white/10"
              >
                पाँचों तल देखें
              </a>
            </div>
            <p className="mt-5 flex items-start gap-2 text-sm leading-6 text-[#e9d5bf]">
              <MapPin size={18} className="mt-1 shrink-0" />
              खटंगिया, दौना रोड, जसरा, प्रयागराज, उत्तर प्रदेश
            </p>
          </div>

          <div className="rounded-3xl border border-[#e8c77f]/30 bg-white/5 p-5 sm:p-7">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#e8bd69]/15 text-[#e8bd69]">
                <Building2 size={30} />
              </div>
              <div>
                <p className="text-sm text-[#e8c77f]">मंदिर संरचना</p>
                <h2 className="mt-1 text-xl font-bold text-[#fff5e4]">
                  पाँच स्तरों का भ्रमण
                </h2>
              </div>
            </div>

            <div className="mt-7 space-y-3">
              {floors.map((floor, index) => (
                <div
                  key={floor.title}
                  className="flex items-center gap-4 rounded-xl border border-white/10 bg-black/10 p-3"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#e8c77f]/40 text-sm font-bold text-[#e8c77f]">
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-[#fff5e4]">
                      {floor.number}
                    </p>
                    <p className="mt-1 text-xs text-[#e9d5bf]">
                      {floor.title}
                    </p>
                  </div>
                  <CheckCircle2 size={18} className="shrink-0 text-[#e8c77f]" />
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs leading-6 text-[#e9d5bf]">
              प्रत्येक तल के विशेष आकर्षणों का विवरण मंदिर प्रशासन
              से सत्यापित जानकारी मिलने पर जोड़ा जाएगा।
            </p>
          </div>
        </div>
        <div className="h-1 bg-gradient-to-r from-[#95612c] via-[#f0d18b] to-[#95612c]" />
      </section>

      <section id="floor-guide" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto mb-8 max-w-2xl text-center">
          <p className="text-sm font-semibold text-[#9a642a]">भ्रमण मार्ग</p>
          <h2 className="mt-2 text-2xl font-bold sm:text-3xl">
            मंदिर के पाँचों स्तर
          </h2>
          <p className="mt-3 text-sm leading-7 text-[#806f62]">
            एक ही टूर टिकट के अंतर्गत भूमि तल और चारों ऊपरी तल का
            भ्रमण प्रस्तावित है। वास्तविक प्रवेश उपलब्धता और नियम
            मंदिर प्रशासन के निर्देशों के अनुसार होंगे।
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {floors.map((floor, index) => (
            <article
              key={floor.title}
              className="rounded-2xl border border-[#e8ddca] bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div className="flex items-center justify-between">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#f6ecd9] text-[#8c5b25]">
                  <Building2 size={24} />
                </span>
                <span className="text-xs font-semibold text-[#9a642a]">
                  स्तर {index + 1}/5
                </span>
              </div>
              <h3 className="mt-4 text-lg font-bold">{floor.number}</h3>
              <p className="mt-1 text-xs font-medium text-[#9a642a]">
                {floor.title}
              </p>
              <p className="mt-3 text-sm leading-7 text-[#806f62]">
                {floor.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-[#f4ead8]">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <p className="text-sm font-semibold text-[#9a642a]">यात्रा से पहले</p>
            <h2 className="mt-2 text-2xl font-bold">भ्रमण की आवश्यक जानकारी</h2>
            <div className="mt-5 space-y-4">
              {benefits.map((benefit) => (
                <div key={benefit} className="flex items-start gap-3">
                  <CheckCircle2 size={20} className="mt-1 shrink-0 text-[#8c5b25]" />
                  <p className="text-sm leading-7 text-[#66534a]">{benefit}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-[#e5d5b9] bg-white p-6">
            <div className="flex items-center gap-3">
              <CalendarDays className="text-[#9a642a]" size={25} />
              <h3 className="text-xl font-bold">अपना भ्रमण निर्धारित करें</h3>
            </div>
            <p className="mt-3 text-sm leading-7 text-[#806f62]">
              यात्रा की तारीख चुनने और टिकट अनुरोध के लिए आगे बढ़ें।
              टिकट की उपलब्धता, समय और शुल्क की पुष्टि प्रशासन द्वारा
              की जाएगी।
            </p>
            <div className="mt-5 flex flex-wrap gap-3 text-xs text-[#806f62]">
              <span className="flex items-center gap-2">
                <Clock3 size={16} /> समय की पुष्टि आवश्यक
              </span>
              <span className="flex items-center gap-2">
                <ShieldCheck size={16} /> प्रशासन की स्वीकृति
              </span>
            </div>
            <Link
              to="/tourism/ticket"
              className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-[#7b1b26] px-5 py-3 font-bold !text-white transition hover:bg-[#5f111c]"
            >
              टिकट अनुरोध करें <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
