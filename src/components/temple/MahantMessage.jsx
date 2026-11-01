import { Quote, UserRound } from "lucide-react";

function MahantMessage() {
  return (
    <section className="relative overflow-hidden bg-[#f5eee2] py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* =================================================
            Section heading
            ================================================= */}

        <div className="mb-12 max-w-2xl sm:mb-16">
          <div className="mb-5 flex items-center gap-3">
            <span className="h-px w-10 bg-[#c99a3d]" />

            <span className="text-sm font-semibold tracking-[0.2em] text-[#7a2732]">
              महंत का संदेश
            </span>
          </div>

          <h2 className="font-serif text-3xl leading-tight text-[#321b1e] sm:text-4xl lg:text-5xl">
            आस्था और
            <span className="block text-[#6b1f2a]">
              संस्कार की दृष्टि
            </span>
          </h2>

          <p className="mt-5 text-base leading-8 text-[#675659] sm:text-lg">
            श्री कैलाश धाम मंदिर की धार्मिक परंपराओं, सेवा और
            आध्यात्मिक संस्कारों के प्रति महंत जी के दृष्टिकोण को
            इस संदेश के माध्यम से प्रस्तुत किया गया है।
          </p>
        </div>

        {/* =================================================
            Main message layout
            ================================================= */}

        <div className="grid overflow-hidden border border-[#d9c7a4] bg-[#fffaf2] lg:grid-cols-[0.85fr_1.15fr]">
          {/* =================================================
    Portrait
    ================================================= */}

          <div className="relative h-[420px] bg-[#e8dfd0] sm:h-[460px] lg:h-[480px]">
            <img
              src="/images/temple/mahant.png"
              alt="पं. श्री सुशील कुमार द्विवेदी, मुख्य पुजारी — महंत"
              className="absolute inset-0 h-full w-full object-cover object-top"
            />

            <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#321b1e]/90 via-[#321b1e]/35 to-transparent" />

            <div className="absolute bottom-6 left-6 right-6 sm:bottom-7 sm:left-7 sm:right-7">
              <p className="text-xs font-semibold tracking-[0.2em] text-[#e3bd5c]">
                श्री कैलाश धाम मंदिर
              </p>

              <h3 className="mt-2 font-serif text-2xl text-[#fff4d8] sm:text-3xl">
                पं. सुशील पुजारी जी महराज
              </h3>

              <p className="mt-1 text-sm text-[#f1dfbd]">
                मुख्य पुजारी — महंत
              </p>
              
            </div>
          </div>

          {/* =================================================
              Message
              ================================================= */}

          <div className="relative flex flex-col justify-center p-7 sm:p-10 lg:p-14">
            {/* Large quote mark */}
            <div
              className="absolute right-7 top-7 text-[#c99a3d]/20 sm:right-10 sm:top-10"
              aria-hidden="true"
            >
              <Quote size={64} strokeWidth={1} />
            </div>

            <div className="relative max-w-2xl">
              {/* Quote icon */}
              <div className="mb-7 flex h-11 w-11 items-center justify-center rounded-full bg-[#6b1f2a] text-[#e4bb5b]">
                <Quote size={19} />
              </div>

              {/* Main message */}
              <p className="font-serif text-xl leading-[1.8] text-[#6b1f2a] sm:text-2xl lg:text-[26px]">
                श्री कैलाश धाम मंदिर हमारे लिए केवल पूजा का स्थान
                नहीं, बल्कि श्रद्धा, संस्कार, सेवा और आध्यात्मिक
                चेतना का पावन केंद्र है। भगवान शिव की कृपा से इस
                धाम से जुड़ने वाले प्रत्येक श्रद्धालु के जीवन में
                शांति, सद्भाव और धर्म के प्रति आस्था का प्रकाश
                बढ़े, यही हमारी भावना है।
              </p>

              <p className="mt-6 text-base leading-8 text-[#675659] sm:text-lg">
                मंदिर में होने वाले पूजा-पाठ, धार्मिक अनुष्ठानों,
                भजन, संकीर्तन, कथा एवं अन्य धार्मिक कार्यक्रमों का
                उद्देश्य श्रद्धालुओं को अपनी सनातन परंपराओं से जोड़ना
                और सामूहिक रूप से आध्यात्मिक वातावरण को सुदृढ़ करना
                है। हम चाहते हैं कि मंदिर आने वाला प्रत्येक भक्त
                श्रद्धा और शांति का अनुभव लेकर लौटे।
              </p>

              <p className="mt-5 text-base leading-8 text-[#675659] sm:text-lg">
                मंदिर की सेवा केवल धार्मिक अनुष्ठानों तक सीमित नहीं
                है। अन्नदान, शिक्षा संबंधी सहयोग, जनकल्याणकारी
                गतिविधियों तथा आवश्यकता के अनुसार विभिन्न सेवा
                कार्यों में सहभागिता भी हमारी सेवा भावना का हिस्सा
                है। समाज के प्रत्येक वर्ग की सहभागिता से ही ऐसी
                सेवा परंपरा आगे बढ़ती है।
              </p>

              <p className="mt-5 text-base leading-8 text-[#675659] sm:text-lg">
                मैं सभी श्रद्धालुओं से आग्रह करता हूँ कि मंदिर की
                धार्मिक परंपराओं का सम्मान करते हुए अपनी सामर्थ्य
                के अनुसार सेवा, सहयोग और सद्भावना में सहभागी बनें।
                भगवान महादेव की कृपा सभी भक्तों और उनके परिवारों पर
                बनी रहे तथा सबके जीवन में सुख, शांति और मंगल का
                प्रकाश हो।
              </p>

              {/* Divider */}
              <div className="my-8 h-px w-16 bg-[#c99a3d]" />

              {/* Sanskrit */}
              <div className="border-l-2 border-[#c99a3d] pl-5">
                <p className="font-serif text-xl leading-relaxed text-[#6b1f2a] sm:text-2xl">
                  उद्धरेदात्मनात्मानं नात्मानमवसादयेत् ॥
                </p>

                <p className="mt-2 text-sm leading-6 text-[#756366]">
                  मनुष्य को स्वयं अपने द्वारा अपना उत्थान करना चाहिए,
                  स्वयं को नीचे नहीं गिराना चाहिए।
                </p>

                <p className="mt-2 text-xs tracking-wide text-[#9a7425]">
                  — श्रीमद्भगवद्गीता ६.५
                </p>
              </div>

              {/* =================================================
                  Identity / Signature
                  ================================================= */}

              <div className="mt-9 flex items-center gap-4 border-t border-[#e0d1b7] pt-6">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#c99a3d]/60 text-[#7a2732]">
                  <UserRound size={19} />
                </div>

                <div>
                  <p className="font-serif text-lg text-[#321b1e]">
                    पं. सुशील पुजारी जी महराज
                  </p>

                  <p className="text-sm text-[#756366]">
                    मुख्य पुजारी — महंत
                  </p>
                  <p className="text-sm text-[#756366]">
                  संपर्क :+91 9450737761
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default MahantMessage;