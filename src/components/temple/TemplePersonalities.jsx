function TemplePersonalities() {
  const personalities = [
    {
      role: "मंदिर निर्माण सेवा प्रमुख",
      name: "स्व. शंकर लाल केसरवानी चरणरज",
      image: "/images/temple/founder.png",
    },
    {
      role: "मुख्य पुजारी — महंत",
      name: "पं. सुशील पुजारी जी महराज",
      image: "/images/temple/mahant.png",
    },
    {
      role: "मंदिर प्रबंधक / सचिव",
      name: "पं. श्री मातादीन मिश्र (बबऊ)",
      image: "/images/temple/manager.png",
    },
  ];

  const contributors = [
  {
    name: "श्री मातादीन मिश्र (बबऊ)",
    location: "खटंगिया, जसरा, बारा, जनपद प्रयागराज",
  },
  {
    name: "श्री चिरोंजी लाल मिश्र",
    location: "खटंगिया, जसरा, बारा, जनपद प्रयागराज",
  },
  {
    name: "श्री स्व. साधु मिश्र",
    location: "खटंगिया, जसरा, बारा, जनपद प्रयागराज",
  },
  {
    name: "श्री फूलचन्द्र मिश्र",
    location: "खटंगिया, जसरा, बारा, जनपद प्रयागराज",
  },
  {
    name: "श्री राम शिरोमणि मिश्र",
    location: "खटंगिया, जसरा, बारा, जनपद प्रयागराज",
  },
  {
    name: "श्री गोपीचन्द्र रतन केसरवानी",
    location: "जसरा, बारा, जनपद प्रयागराज",
  },
];

  return (
    <section className="relative overflow-hidden bg-[#fffaf2] py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* =====================================================
            SECTION HEADING
            ===================================================== */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-5 flex items-center justify-center gap-3">
            <span className="h-px w-10 bg-[#c99a3d]" />

            <span className="font-serif text-lg text-[#9a7425]">
              ॐ
            </span>

            <span className="h-px w-10 bg-[#c99a3d]" />
          </div>

          <p className="text-sm font-semibold tracking-[0.2em] text-[#7a2732]">
            प्रमुख व्यक्तित्व
          </p>

          <h2 className="mt-3 font-serif text-3xl leading-tight text-[#321b1e] sm:text-4xl lg:text-5xl">
            मंदिर से जुड़े
            <span className="block text-[#6b1f2a]">
              प्रमुख व्यक्तित्व
            </span>
          </h2>

          <p className="mt-5 text-base leading-8 text-[#675659] sm:text-lg">
            मंदिर के प्रबंधन, धार्मिक सेवा और निर्माण से जुड़े प्रमुख
            व्यक्तित्व।
          </p>
        </div>

        {/* =====================================================
            PRINCIPAL PERSONALITIES
            ===================================================== */}
        <div className="mt-12 grid gap-6 md:grid-cols-3 lg:mt-16 lg:gap-8">
          {personalities.map((person) => {

            return (
              <article
                key={person.name}
                className="group overflow-hidden border border-[#d9c7a4] bg-[#f8f0e3] transition-all duration-300 hover:-translate-y-1 hover:border-[#c99a3d]/70 hover:shadow-[0_18px_45px_rgba(61,31,25,0.08)]"
              >
                {/* Photo */}
                <div className="relative aspect-[3/3] overflow-hidden bg-[#e8dfd0] content-center">
                  <img
                    src={person.image}
                    alt={person.name}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.025]"
                  />

                  <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-[#321b1e]/90 via-[#321b1e]/35 to-transparent" />

                  {/* Role */}
                  <div className="absolute bottom-5 left-5 right-5 flex items-center gap-3">  

                    <p className="text-s font-semibold tracking-[0.08em] text-[#e3bd5c]">
                      {person.role}
                    </p>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 sm:p-7">
                  <p className="text-xs font-semibold tracking-[0.16em] text-[#9a7425]">
                    श्री कैलाश धाम मंदिर
                  </p>

                  <h3 className="mt-2 font-serif text-2xl font-semibold leading-snug text-[#6b1f2a]">
                    {person.name}
                  </h3>
                </div>
              </article>
            );
          })}
        </div>

        {/* =====================================================
            CONSTRUCTION / LAND CONTRIBUTORS
            ===================================================== */}
       <div className="mt-16 border-t border-[#d9c7a4] pt-12">
  <div className="text-center">
    <p className="text-xs font-semibold tracking-[0.18em] text-[#9a7425]">
      मंदिर निर्माण में सहयोग
    </p>

    <h3 className="mt-2 font-serif text-2xl text-[#6b1f2a] sm:text-3xl">
      सहयोग से निर्मित एक धार्मिक विरासत
    </h3>

    <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-[#756366]">
      मंदिर निर्माण एवं भूमि सहयोग से जुड़े व्यक्तित्वों के प्रति
      सम्मान और कृतज्ञता।
    </p>
  </div>

  <div className="mx-auto mt-8 grid max-w-5xl gap-3 sm:grid-cols-2 lg:grid-cols-3">
    {contributors.map((person) => (
      <div
        key={person.name}
        className="border border-[#d9c7a4] bg-[#fffaf2] px-5 py-4"
      >
        <p className="font-serif text-base leading-6 text-[#6b1f2a]">
          {person.name}
        </p>

        <p className="mt-1 text-xs leading-5 text-[#756366]">
          {person.location}
        </p>
      </div>
    ))}
  </div>
</div>

      </div>
      {/* =====================================================
    DONATION / SEVA QUOTE
    ===================================================== */}
      <div className="mx-auto mt-14 max-w-4xl border-y border-[#d9c7a4] px-5 py-7 text-center sm:mt-16 sm:px-10">
        <p className="font-serif text-xl leading-relaxed text-[#6b1f2a] sm:text-2xl">
          श्रद्धया देयम् । अश्रद्धया अदेयम् ॥
        </p>

        <p className="mt-2 text-sm leading-6 text-[#756366]">
          श्रद्धा और सम्मान के साथ दिया गया दान ही सेवा की सच्ची भावना को
          प्रकट करता है।
        </p>

        <p className="mt-2 text-xs text-[#9a7425]">
          — तैत्तिरीय उपनिषद् १.११.३
        </p>
      </div>
    </section>
  );
}

export default TemplePersonalities; 