import "./tour-ticket-receipt.css";

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("hi-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatIssuedDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("hi-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function TourTicketReceipt({ booking, receiptRef }) {
  if (!booking) return null;

  return (
    <div
      ref={receiptRef}
      className="tour-ticket-receipt"
      aria-hidden="true"
    >
      <div className="ttr-page">
        {/* Decorative frames */}
        <div className="ttr-frame" />
        <div className="ttr-frame-inner" />

        {/* Watermark logo */}
        <img
          src="/images/logo/logo.png"
          alt=""
          className="ttr-watermark"
        />

        {/* Readable content */}
        <div className="ttr-content">

          {/* ── Header ── */}
          <header className="ttr-header">
            <div className="ttr-devotional-row">
              <span>॥ ॐ नमः शिवाय ॥</span>
              <span>॥ हर हर महादेव ॥</span>
            </div>

            <img
              src="/images/logo/logo.png"
              alt="श्री कैलाश धाम मंदिर"
              className="ttr-logo"
            />

            <h1>श्री कैलाश धाम मंदिर</h1>

            <p className="ttr-location">दौना, जसरा</p>

            <div className="ttr-heading-decoration">
              <span />
              <i />
              <span />
            </div>

            <h2>मंदिर भ्रमण टिकट</h2>

            <p className="ttr-subtitle">टिकट प्राप्ति रसीद</p>
          </header>

          {/* ── Ticket meta: number + date ── */}
          <section className="ttr-meta">
            <div className="ttr-meta-number">
              <span>टिकट संख्या</span>
              <strong>{booking.ticketNumber || "—"}</strong>
            </div>

            <div className="ttr-meta-date">
              <span>जारी दिनांक</span>
              <strong>{formatIssuedDate(booking.issuedAt)}</strong>
            </div>
          </section>

          {/* ── Intro text ── */}
          <div className="ttr-intro">
            <p>
              आपकी मंदिर भ्रमण बुकिंग श्री कैलाश धाम मंदिर में
              सफलतापूर्वक दर्ज हो गई है।
            </p>
            <p>
              कृपया भ्रमण के दिन यह रसीद साथ लाएँ एवं प्रवेश द्वार
              पर दिखाएँ।
            </p>
          </div>

          {/* ── Two-column: visitor info + visit details ── */}
          <div className="ttr-columns">
            {/* Visitor info */}
            <section className="ttr-card">
              <div className="ttr-card-heading">
                <span className="ttr-card-icon">ॐ</span>
                <h3>आगंतुक की जानकारी</h3>
              </div>
              <div className="ttr-fields">
                <TtrField label="नाम" value={booking.contactName} />
                <TtrField label="मोबाइल नंबर" value={booking.mobile} />
                <TtrField
                  label="ईमेल"
                  value={booking.email || "—"}
                />
              </div>
            </section>

            {/* Visit details */}
            <section className="ttr-card">
              <div className="ttr-card-heading">
                <span className="ttr-card-icon">ॐ</span>
                <h3>भ्रमण का विवरण</h3>
              </div>
              <div className="ttr-fields">
                <TtrField
                  label="भ्रमण दिनांक"
                  value={formatDate(booking.visitDate)}
                />
                <TtrField
                  label="कुल आगंतुक"
                  value={String(booking.visitorCount)}
                />
                <TtrField
                  label="भ्रमण स्तर"
                  value="भूमि तल + 4 ऊपरी तल"
                />
              </div>
            </section>
          </div>

          {/* ── Amount details ── */}
          <section className="ttr-amount-card">
            <div className="ttr-card-heading">
              <span className="ttr-card-icon">₹</span>
              <h3>शुल्क विवरण</h3>
            </div>
            <div className="ttr-amount-inner">
              <div className="ttr-amount-cell">
                <span>प्रति व्यक्ति शुल्क</span>
                <strong>₹20</strong>
              </div>
              <div className="ttr-amount-cell">
                <span>कुल आगंतुक</span>
                <strong>{booking.visitorCount}</strong>
              </div>
              <div className="ttr-amount-cell ttr-total">
                <span>कुल भुगतान</span>
                <strong>₹{booking.amount}</strong>
              </div>
            </div>
          </section>

          {/* ── Payment reference ── */}
          <section className="ttr-card ttr-card-full">
            <div className="ttr-card-heading">
              <span className="ttr-card-icon">॥</span>
              <h3>भुगतान संदर्भ</h3>
            </div>
            <div className="ttr-fields ttr-fields-two">
              <TtrField
                label="भुगतान ID"
                value={booking.paymentId || "—"}
              />
              <TtrField
                label="भुगतान स्थिति"
                value={booking.paymentStatus || "सफल"}
              />
            </div>
          </section>

          {/* ── Status badge ── */}
          <section className="ttr-status">
            <div className="ttr-status-icon">✓</div>
            <div>
              <span>स्थिति</span>
              <strong>टिकट जारी — बुकिंग पुष्ट</strong>
            </div>
          </section>

          {/* ── Notice ── */}
          <section className="ttr-notice">
            <strong>महत्वपूर्ण सूचना</strong>
            <p>
              यह टिकट केवल उल्लिखित दिनांक एवं आगंतुक संख्या के लिए
              मान्य है। प्रवेश द्वार पर यह रसीद अथवा टिकट संख्या
              दिखाना अनिवार्य है। भ्रमण संबंधी नियम एवं समय
              मंदिर प्रबंधन द्वारा निर्धारित किए जाएंगे।
            </p>
          </section>

          {/* ── Footer ── */}
          <footer className="ttr-footer">
            <div>
              <strong>श्री कैलाश धाम मंदिर</strong>
              <span>दौना, जसरा</span>
            </div>

            <div className="ttr-footer-mantra">
              <span>॥ ॐ नमः शिवाय ॥</span>
              <span>आस्था • सेवा • संस्कृति</span>
            </div>

            <div className="ttr-footer-right">
              <span>आपकी श्रद्धा हमारा सौभाग्य है।</span>
              <strong>हर हर महादेव ॥</strong>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}

function TtrField({ label, value }) {
  return (
    <div className="ttr-field">
      <span>{label}</span>
      <strong>{value || "—"}</strong>
    </div>
  );
}

export default TourTicketReceipt;
