import { useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Download,
  IndianRupee,
  LayoutDashboard,
  Link2,
  LoaderCircle,
  LogIn,
  MapPin,
  MonitorPlay,
  RefreshCw,
  Search,
  ShieldCheck,
  Ticket,
  Users,
  X,
} from "lucide-react";
import {
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  setDoc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../config/firebase";

/* ─────────────────────────────────────────────────────────
   Simple PIN-based access guard (no Firebase Auth needed)
───────────────────────────────────────────────────────── */
const ADMIN_PIN = "108108";

/* ─────────────────────────────────────────────────────────
   Helpers
───────────────────────────────────────────────────────── */
function formatTimestamp(value) {
  if (!value) return "—";
  let date;
  if (value?.toDate) date = value.toDate();          // Firestore Timestamp
  else date = new Date(value);
  if (isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("hi-IN", {
    day: "numeric", month: "short", year: "numeric",
  }).format(date);
}

function formatVisitDate(value) {
  if (!value) return "—";
  const date = new Date(`${value}T00:00:00`);
  if (isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("hi-IN", {
    day: "numeric", month: "short", year: "numeric",
  }).format(date);
}

function rupee(n) {
  return `₹${Number(n || 0).toLocaleString("en-IN")}`;
}

function StatusBadge({ status }) {
  const map = {
    payment_verified:  "bg-emerald-50 text-emerald-700 border-emerald-200",
    confirmed:         "bg-emerald-50 text-emerald-700 border-emerald-200",
    submitted:         "bg-amber-50  text-amber-700  border-amber-200",
    pending_payment:   "bg-amber-50  text-amber-700  border-amber-200",
    "सफल":            "bg-emerald-50 text-emerald-700 border-emerald-200",
  };
  const label = {
    payment_verified: "सत्यापित",
    confirmed:        "पुष्ट",
    submitted:        "प्रस्तुत",
    pending_payment:  "भुगतान बाकी",
    "सफल":           "सफल",
  };
  const cls = map[status] || "bg-gray-50 text-gray-600 border-gray-200";
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${cls}`}>
      {label[status] || status || "—"}
    </span>
  );
}

/* ─────────────────────────────────────────────────────────
   Stat Card
───────────────────────────────────────────────────────── */
function StatCard({ icon: Icon, iconBg, iconColor, label, value, sub }) {
  return (
    <div className="rounded-2xl border border-[#e3d8c8] bg-white p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-[#8d7971]">{label}</p>
          <p className="mt-2 text-3xl font-bold text-[#4a1720]">{value}</p>
        </div>
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconBg} ${iconColor}`}>
          <Icon size={20} />
        </div>
      </div>
      {sub && <p className="mt-4 text-xs text-[#8d7971]">{sub}</p>}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Sortable Table Header
───────────────────────────────────────────────────────── */
function SortTh({ label, field, sortKey, sortDir, onSort }) {
  const active = sortKey === field;
  return (
    <th
      className="cursor-pointer select-none px-4 py-3 text-left text-[11px] font-semibold text-[#9b8880] hover:text-[#4a1720]"
      onClick={() => onSort(field)}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        {active ? (
          sortDir === "asc" ? <ChevronUp size={12} /> : <ChevronDown size={12} />
        ) : (
          <ChevronDown size={12} className="opacity-30" />
        )}
      </span>
    </th>
  );
}

/* ─────────────────────────────────────────────────────────
   Export CSV helper — CSV injection safe
───────────────────────────────────────────────────────── */
function sanitizeCsvCell(value) {
  const str = (value ?? "").toString().replace(/"/g, '""');
  // Prevent formula injection: prefix dangerous chars with tab
  return /^[=+\-@\t\r]/.test(str) ? `\t${str}` : str;
}

function exportCSV(rows, columns, filename) {
  const header = columns.map((c) => c.label).join(",");
  const body = rows
    .map((r) => columns.map((c) => `"${sanitizeCsvCell(r[c.key])}"`).join(","))
    .join("\n");
  const blob = new Blob([`\uFEFF${header}\n${body}`], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/* ═══════════════════════════════════════════════════════════
   LOGIN SCREEN
═══════════════════════════════════════════════════════════ */
function LoginScreen({ onLogin }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (pin === ADMIN_PIN) {
      onLogin();
    } else {
      setError("गलत PIN। कृपया पुनः प्रयास करें।");
      setPin("");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#4a1720] px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center">
          <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border-2 border-[#e4bb5b]/40 bg-[#3a1018] p-2">
            <img src="/images/logo/logo.png" alt="logo" className="h-full w-full object-contain" />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-[#fffaf2]">श्री कैलाश धाम</h1>
          <p className="mt-1 text-sm tracking-widest text-[#e4bb5b]">ADMIN PANEL</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-8 rounded-2xl border border-[#e4bb5b]/20 bg-white/5 p-7 backdrop-blur-sm">
          <label htmlFor="admin-pin" className="block text-sm font-semibold text-[#fffaf2]">
            प्रशासन PIN दर्ज करें
          </label>
          <input
            id="admin-pin"
            type="password"
            inputMode="numeric"
            maxLength={10}
            value={pin}
            onChange={(e) => { setPin(e.target.value); setError(""); }}
            placeholder="••••••"
            className="mt-3 w-full rounded-xl border border-[#e4bb5b]/30 bg-white/10 px-4 py-3 text-center text-2xl tracking-widest text-[#fffaf2] placeholder-white/20 outline-none focus:border-[#e4bb5b] focus:ring-2 focus:ring-[#e4bb5b]/20"
          />
          {error && <p className="mt-2 text-center text-xs text-red-300">{error}</p>}
          <button
            type="submit"
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#e4bb5b] py-3 font-bold text-[#4a1720] transition hover:bg-[#f3d58a]"
          >
            <LogIn size={18} />
            प्रवेश करें
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-[#f1dfbd]/30">
          श्री कैलाश धाम मंदिर — प्रशासन पोर्टल
        </p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MEMBERSHIPS SECTION
═══════════════════════════════════════════════════════════ */
function MembershipsSection({ data, loading }) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState("submittedAt");
  const [sortDir, setSortDir] = useState("desc");

  const handleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let rows = q
      ? data.filter((r) =>
          `${r.name} ${r.mobile} ${r.email} ${r.address} ${r.status}`
            .toLowerCase()
            .includes(q)
        )
      : [...data];
    rows.sort((a, b) => {
      let va = a[sortKey] ?? "";
      let vb = b[sortKey] ?? "";
      if (sortKey === "submittedAt") {
        va = va?.toDate ? va.toDate() : new Date(va || 0);
        vb = vb?.toDate ? vb.toDate() : new Date(vb || 0);
        return sortDir === "asc" ? va - vb : vb - va;
      }
      if (sortKey === "amount") {
        return sortDir === "asc" ? Number(va) - Number(vb) : Number(vb) - Number(va);
      }
      va = String(va).toLowerCase();
      vb = String(vb).toLowerCase();
      return sortDir === "asc" ? va.localeCompare(vb) : vb.localeCompare(va);
    });
    return rows;
  }, [data, search, sortKey, sortDir]);

  const csvCols = [
    { key: "name", label: "नाम" },
    { key: "mobile", label: "मोबाइल" },
    { key: "email", label: "ईमेल" },
    { key: "address", label: "पता" },
    { key: "amount", label: "शुल्क" },
    { key: "status", label: "स्थिति" },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-serif text-2xl text-[#4a1720]">सदस्यता पंजीकरण</h2>
          <p className="mt-1 text-xs text-[#9b8880]">Firebase — memberships collection</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#9b8880]" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="नाम, मोबाइल, ईमेल…"
              className="rounded-xl border border-[#e3d8c8] bg-white py-2 pl-9 pr-4 text-sm outline-none focus:border-[#8b2635] focus:ring-2 focus:ring-[#8b2635]/10"
            />
          </div>
          <button
            onClick={() => exportCSV(filtered, csvCols, "memberships.csv")}
            className="flex items-center gap-1.5 rounded-xl border border-[#e3d8c8] bg-white px-3 py-2 text-xs font-semibold text-[#4a1720] transition hover:bg-[#f8eee2]"
          >
            <Download size={14} /> CSV
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#e3d8c8] bg-white">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-[#8d7971]">
            <LoaderCircle size={20} className="animate-spin" /> डेटा लोड हो रहा है…
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-sm text-[#9b8880]">
            {search ? "कोई परिणाम नहीं मिला।" : "अभी तक कोई सदस्यता नहीं।"}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[780px] text-left">
              <thead className="border-b border-[#eee5d9] bg-[#fcfaf6]">
                <tr>
                  <th className="px-4 py-3 text-[11px] font-semibold text-[#9b8880]">#</th>
                  <SortTh label="नाम" field="name" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                  <SortTh label="मोबाइल" field="mobile" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                  <th className="px-4 py-3 text-[11px] font-semibold text-[#9b8880]">ईमेल</th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-[#9b8880]">पता</th>
                  <SortTh label="शुल्क" field="amount" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                  <th className="px-4 py-3 text-[11px] font-semibold text-[#9b8880]">स्थिति</th>
                  <SortTh label="दिनांक" field="submittedAt" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                </tr>
              </thead>
              <tbody>
                {filtered.map((row, i) => (
                  <tr key={row._id} className="border-b border-[#f0e9df] last:border-0 hover:bg-[#fcfaf6]">
                    <td className="px-4 py-3.5 text-xs text-[#b0a098]">{i + 1}</td>
                    <td className="px-4 py-3.5 text-sm font-semibold text-[#4a1720]">{row.name || "—"}</td>
                    <td className="px-4 py-3.5 text-sm text-[#6f5b55]">{row.mobile || "—"}</td>
                    <td className="max-w-[160px] truncate px-4 py-3.5 text-xs text-[#6f5b55]">{row.email || "—"}</td>
                    <td className="max-w-[180px] truncate px-4 py-3.5 text-xs text-[#6f5b55]">{row.address || "—"}</td>
                    <td className="px-4 py-3.5 text-sm font-bold text-[#4a1720]">{rupee(row.amount)}</td>
                    <td className="px-4 py-3.5"><StatusBadge status={row.status} /></td>
                    <td className="px-4 py-3.5 text-xs text-[#9b8880]">{formatTimestamp(row.submittedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!loading && filtered.length > 0 && (
          <div className="border-t border-[#eee5d9] px-4 py-3 text-xs text-[#9b8880]">
            कुल {filtered.length} सदस्य · कुल संग्रह{" "}
            <span className="font-bold text-[#4a1720]">
              {rupee(filtered.reduce((s, r) => s + Number(r.amount || 0), 0))}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   TOUR BOOKINGS SECTION
═══════════════════════════════════════════════════════════ */
function TourBookingsSection({ data, loading }) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState("issuedAt");
  const [sortDir, setSortDir] = useState("desc");

  const handleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let rows = q
      ? data.filter((r) =>
          `${r.ticketNumber} ${r.contactName} ${r.mobile} ${r.email} ${r.visitDate}`
            .toLowerCase()
            .includes(q)
        )
      : [...data];
    rows.sort((a, b) => {
      let va = a[sortKey] ?? "";
      let vb = b[sortKey] ?? "";
      if (sortKey === "issuedAt") {
        va = va?.toDate ? va.toDate() : new Date(va || 0);
        vb = vb?.toDate ? vb.toDate() : new Date(vb || 0);
        return sortDir === "asc" ? va - vb : vb - va;
      }
      if (sortKey === "amount" || sortKey === "visitorCount") {
        return sortDir === "asc" ? Number(va) - Number(vb) : Number(vb) - Number(va);
      }
      va = String(va).toLowerCase();
      vb = String(vb).toLowerCase();
      return sortDir === "asc" ? va.localeCompare(vb) : vb.localeCompare(va);
    });
    return rows;
  }, [data, search, sortKey, sortDir]);

  const csvCols = [
    { key: "ticketNumber", label: "टिकट संख्या" },
    { key: "contactName", label: "नाम" },
    { key: "mobile", label: "मोबाइल" },
    { key: "email", label: "ईमेल" },
    { key: "visitDate", label: "भ्रमण दिनांक" },
    { key: "visitorCount", label: "आगंतुक" },
    { key: "amount", label: "शुल्क" },
    { key: "paymentStatus", label: "भुगतान स्थिति" },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-serif text-2xl text-[#4a1720]">भ्रमण टिकट बुकिंग</h2>
          <p className="mt-1 text-xs text-[#9b8880]">Firebase — tour_bookings collection</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#9b8880]" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="टिकट नं, नाम, मोबाइल…"
              className="rounded-xl border border-[#e3d8c8] bg-white py-2 pl-9 pr-4 text-sm outline-none focus:border-[#8b2635] focus:ring-2 focus:ring-[#8b2635]/10"
            />
          </div>
          <button
            onClick={() => exportCSV(filtered, csvCols, "tour_bookings.csv")}
            className="flex items-center gap-1.5 rounded-xl border border-[#e3d8c8] bg-white px-3 py-2 text-xs font-semibold text-[#4a1720] transition hover:bg-[#f8eee2]"
          >
            <Download size={14} /> CSV
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#e3d8c8] bg-white">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-[#8d7971]">
            <LoaderCircle size={20} className="animate-spin" /> डेटा लोड हो रहा है…
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-sm text-[#9b8880]">
            {search ? "कोई परिणाम नहीं मिला।" : "अभी तक कोई बुकिंग नहीं।"}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left">
              <thead className="border-b border-[#eee5d9] bg-[#fcfaf6]">
                <tr>
                  <th className="px-4 py-3 text-[11px] font-semibold text-[#9b8880]">#</th>
                  <SortTh label="टिकट संख्या" field="ticketNumber" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                  <SortTh label="नाम" field="contactName" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                  <th className="px-4 py-3 text-[11px] font-semibold text-[#9b8880]">मोबाइल</th>
                  <SortTh label="भ्रमण दिनांक" field="visitDate" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                  <SortTh label="आगंतुक" field="visitorCount" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                  <SortTh label="शुल्क" field="amount" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                  <th className="px-4 py-3 text-[11px] font-semibold text-[#9b8880]">भुगतान</th>
                  <SortTh label="जारी दिनांक" field="issuedAt" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                </tr>
              </thead>
              <tbody>
                {filtered.map((row, i) => (
                  <tr key={row._id} className="border-b border-[#f0e9df] last:border-0 hover:bg-[#fcfaf6]">
                    <td className="px-4 py-3.5 text-xs text-[#b0a098]">{i + 1}</td>
                    <td className="px-4 py-3.5 text-xs font-bold text-[#8b2635]">{row.ticketNumber || "—"}</td>
                    <td className="px-4 py-3.5 text-sm font-semibold text-[#4a1720]">{row.contactName || "—"}</td>
                    <td className="px-4 py-3.5 text-sm text-[#6f5b55]">{row.mobile || "—"}</td>
                    <td className="px-4 py-3.5 text-sm text-[#6f5b55]">{formatVisitDate(row.visitDate)}</td>
                    <td className="px-4 py-3.5 text-center text-sm font-semibold text-[#4a1720]">{row.visitorCount || "—"}</td>
                    <td className="px-4 py-3.5 text-sm font-bold text-[#4a1720]">{rupee(row.amount)}</td>
                    <td className="px-4 py-3.5"><StatusBadge status={row.paymentStatus || row.status} /></td>
                    <td className="px-4 py-3.5 text-xs text-[#9b8880]">{formatTimestamp(row.issuedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!loading && filtered.length > 0 && (
          <div className="border-t border-[#eee5d9] px-4 py-3 text-xs text-[#9b8880]">
            कुल {filtered.length} बुकिंग · कुल आगंतुक{" "}
            <span className="font-bold text-[#4a1720]">
              {filtered.reduce((s, r) => s + Number(r.visitorCount || 0), 0)}
            </span>{" "}
            · कुल संग्रह{" "}
            <span className="font-bold text-[#4a1720]">
              {rupee(filtered.reduce((s, r) => s + Number(r.amount || 0), 0))}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   LIVE DARSHAN SECTION
═══════════════════════════════════════════════════════════ */
function LiveDarshanSection({ config, onSave }) {
  const [videoUrl, setVideoUrl]   = useState(config?.videoUrl  || "");
  const [title,    setTitle]      = useState(config?.title     || "श्री कैलाश धाम मंदिर — लाइव दर्शन");
  const [status,   setStatus]     = useState(config?.status    || "offline");
  const [saving,   setSaving]     = useState(false);
  const [saved,    setSaved]      = useState(false);
  const [error,    setError]      = useState("");

  // Reset saved indicator after 3s
  useEffect(() => {
    if (!saved) return;
    const t = setTimeout(() => setSaved(false), 3000);
    return () => clearTimeout(t);
  }, [saved]);

  const handleSave = async (e) => {
    e.preventDefault();

    // Validate YouTube URL
    if (videoUrl.trim()) {
      try {
        const parsed = new URL(videoUrl.trim());
        const host = parsed.hostname.replace(/^www\./, "");
        const allowedHosts = ["youtube.com", "youtu.be", "m.youtube.com"];
        if (!allowedHosts.includes(host)) {
          setError("केवल YouTube URL स्वीकार किया जाएगा।");
          return;
        }
        if (parsed.protocol !== "https:") {
          setError("केवल HTTPS YouTube URL स्वीकार किया जाएगा।");
          return;
        }
      } catch {
        setError("कृपया सही YouTube URL दर्ज करें।");
        return;
      }
    }

    if (!videoUrl.trim() && status === "live") {
      setError("लाइव स्थिति के लिए YouTube URL आवश्यक है।");
      return;
    }
    setError("");
    setSaving(true);
    try {
      const payload = {
        videoUrl:  videoUrl.trim(),
        title:     title.trim() || "श्री कैलाश धाम मंदिर — लाइव दर्शन",
        status,
        updatedAt: serverTimestamp(),
      };
      await setDoc(doc(db, "live_darshan", "config"), payload, { merge: true });
      onSave({ ...payload, updatedAt: new Date().toISOString() });
      setSaved(true);
    } catch {
      setError("सहेजने में समस्या आई। कृपया पुनः प्रयास करें।");
    } finally {
      setSaving(false);
    }
  };

  const statusOptions = [
    { value: "live",     label: "🔴 लाइव — अभी चल रहा है",          cls: "text-red-600"     },
    { value: "upcoming", label: "🟡 आने वाला — शीघ्र प्रारंभ होगा", cls: "text-amber-600"   },
    { value: "offline",  label: "⚫ ऑफलाइन — उपलब्ध नहीं",           cls: "text-gray-500"    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl text-[#4a1720]">लाइव दर्शन प्रबंधन</h2>
        <p className="mt-1 text-xs text-[#9b8880]">YouTube लिंक और स्थिति अपडेट करें — changes तुरंत website पर दिखेंगे</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">

        {/* ── Form ── */}
        <form onSubmit={handleSave} className="space-y-5 rounded-2xl border border-[#e3d8c8] bg-white p-6">

          {/* Status selector */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-[#4a1720]">
              प्रसारण स्थिति <span className="text-red-600">*</span>
            </label>
            <div className="grid gap-3 sm:grid-cols-3">
              {statusOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setStatus(opt.value)}
                  className={`flex items-center gap-2 rounded-xl border-2 px-4 py-3 text-sm font-semibold transition
                    ${status === opt.value
                      ? "border-[#4a1720] bg-[#4a1720] text-white"
                      : "border-[#e3d8c8] bg-white text-[#4a1720] hover:border-[#4a1720]/40"}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* YouTube URL */}
          <div>
            <label htmlFor="live-url" className="mb-2 block text-sm font-semibold text-[#4a1720]">
              YouTube वीडियो / लाइव URL
              {status === "live" && <span className="ml-1 text-red-600">*</span>}
            </label>
            <div className="relative">
              <Link2 size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#9b8880]" />
              <input
                id="live-url"
                type="url"
                value={videoUrl}
                onChange={(e) => { setVideoUrl(e.target.value); setError(""); }}
                placeholder="https://www.youtube.com/watch?v=... या https://youtu.be/..."
                className="w-full rounded-xl border border-[#e3d8c8] bg-white py-3 pl-9 pr-4 text-sm outline-none focus:border-[#8b2635] focus:ring-2 focus:ring-[#8b2635]/10"
              />
            </div>
            <p className="mt-1.5 text-xs text-[#9b8880]">
              YouTube Live, video, या shorts — कोई भी YouTube URL यहाँ paste करें।
            </p>
          </div>

          {/* Title */}
          <div>
            <label htmlFor="live-title" className="mb-2 block text-sm font-semibold text-[#4a1720]">
              प्रसारण शीर्षक
            </label>
            <input
              id="live-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="श्री कैलाश धाम मंदिर — लाइव दर्शन"
              className="w-full rounded-xl border border-[#e3d8c8] bg-white px-4 py-3 text-sm outline-none focus:border-[#8b2635] focus:ring-2 focus:ring-[#8b2635]/10"
            />
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {saved && (
            <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
              <CheckCircle2 size={17} />
              सफलतापूर्वक सहेज लिया गया! Website पर तुरंत update हो जाएगा।
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#4a1720] py-3 font-bold text-white transition hover:bg-[#35151c] disabled:opacity-60"
          >
            {saving
              ? <><LoaderCircle size={17} className="animate-spin" /> सहेजा जा रहा है…</>
              : <><CheckCircle2 size={17} /> लाइव सेटिंग सहेजें</>}
          </button>
        </form>

        {/* ── Preview card ── */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-[#e3d8c8] bg-white p-5">
            <h3 className="font-bold text-[#4a1720]">वर्तमान सेटिंग</h3>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-start justify-between gap-3">
                <span className="text-[#9b8880]">स्थिति</span>
                <span className={`font-bold ${
                  status === "live"     ? "text-red-600" :
                  status === "upcoming" ? "text-amber-600" : "text-gray-500"
                }`}>
                  {status === "live" ? "🔴 लाइव" : status === "upcoming" ? "🟡 आने वाला" : "⚫ ऑफलाइन"}
                </span>
              </div>
              <div className="flex items-start justify-between gap-3 border-t border-[#f0e9df] pt-3">
                <span className="text-[#9b8880]">URL</span>
                <span className="max-w-[160px] truncate text-right text-xs font-mono text-[#4a1720]">
                  {videoUrl || "—"}
                </span>
              </div>
              <div className="flex items-start justify-between gap-3 border-t border-[#f0e9df] pt-3">
                <span className="text-[#9b8880]">शीर्षक</span>
                <span className="max-w-[160px] truncate text-right font-semibold text-[#4a1720]">
                  {title || "—"}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-[#4a1720] p-5 text-[#fff8e9]">
            <MonitorPlay size={24} className="text-[#e4bb5b]" />
            <h3 className="mt-3 font-bold">कैसे काम करता है?</h3>
            <ol className="mt-3 space-y-2 text-sm leading-6 text-[#f0dfce]">
              <li>1. YouTube Live URL यहाँ paste करें।</li>
              <li>2. स्थिति <strong className="text-[#e4bb5b]">लाइव</strong> करें।</li>
              <li>3. "सहेजें" button दबाएँ।</li>
              <li>4. Website पर <strong className="text-[#e4bb5b]">तुरंत</strong> video embed दिखने लगेगा।</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   DASHBOARD SECTION
═══════════════════════════════════════════════════════════ */
function DashboardSection({ members, bookings, loading, onNav }) {
  const totalMemberAmount = members.reduce((s, r) => s + Number(r.amount || 0), 0);
  const totalTicketAmount = bookings.reduce((s, r) => s + Number(r.amount || 0), 0);
  const totalVisitors    = bookings.reduce((s, r) => s + Number(r.visitorCount || 0), 0);

  // Recent 5 of each
  const recentMembers  = [...members].slice(0, 5);
  const recentBookings = [...bookings].slice(0, 5);

  return (
    <div className="space-y-7">
      {/* Welcome banner */}
      <section className="relative overflow-hidden rounded-2xl bg-[#4a1720] p-6 text-white sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full border border-[#e4bb5b]/15" />
        <div className="pointer-events-none absolute -bottom-20 -left-12 h-48 w-48 rounded-full border border-[#e4bb5b]/10" />
        <div className="relative">
          <p className="text-xs font-semibold tracking-widest text-[#e4bb5b]">मंदिर प्रबंधन</p>
          <h2 className="mt-3 font-serif text-3xl sm:text-4xl">नमस्कार, व्यवस्थापक 🙏</h2>
          <p className="mt-3 max-w-xl text-sm leading-7 text-white/65">
            श्री कैलाश धाम मंदिर — सदस्यता एवं भ्रमण बुकिंग का संक्षिप्त अवलोकन।
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Users}       iconBg="bg-[#f8eee2]" iconColor="text-[#8b2635]"
          label="कुल सदस्य"         value={loading ? "…" : members.length}  sub="Firebase memberships" />
        <StatCard icon={IndianRupee} iconBg="bg-[#fff6df]" iconColor="text-[#b17b1e]"
          label="सदस्यता संग्रह"    value={loading ? "…" : rupee(totalMemberAmount)} sub="कुल प्राप्त शुल्क" />
        <StatCard icon={Ticket}      iconBg="bg-[#f3eee8]" iconColor="text-[#6b4a3e]"
          label="भ्रमण बुकिंग"      value={loading ? "…" : bookings.length} sub="Firebase tour_bookings" />
        <StatCard icon={MapPin}      iconBg="bg-[#f1eee9]" iconColor="text-[#765646]"
          label="कुल आगंतुक"        value={loading ? "…" : totalVisitors}   sub={`₹${totalTicketAmount.toLocaleString("en-IN")} संग्रह`} />
      </section>

      {/* Two-col grid */}
      <section className="grid gap-6 xl:grid-cols-2">

        {/* Recent members */}
        <div className="overflow-hidden rounded-2xl border border-[#e3d8c8] bg-white">
          <div className="flex items-center justify-between border-b border-[#eee5d9] px-5 py-4">
            <div>
              <h3 className="font-serif text-xl text-[#4a1720]">हाल की सदस्यताएँ</h3>
              <p className="mt-0.5 text-xs text-[#9b8880]">नवीनतम 5 सदस्य</p>
            </div>
            <button onClick={() => onNav("memberships")}
              className="text-xs font-semibold text-[#8b2635] hover:underline">
              सभी देखें →
            </button>
          </div>
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-10 text-[#8d7971]">
              <LoaderCircle size={18} className="animate-spin" />
            </div>
          ) : recentMembers.length === 0 ? (
            <p className="py-10 text-center text-sm text-[#9b8880]">कोई डेटा नहीं।</p>
          ) : (
            <div className="divide-y divide-[#f0e9df]">
              {recentMembers.map((r) => (
                <div key={r._id} className="flex items-center justify-between gap-3 px-5 py-3.5 hover:bg-[#fcfaf6]">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f8eee2] text-[#8b2635]">
                      <Users size={15} />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[#4a1720]">{r.name || "—"}</p>
                      <p className="truncate text-xs text-[#9b8880]">{r.mobile}</p>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-bold text-[#4a1720]">{rupee(r.amount)}</p>
                    <StatusBadge status={r.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent bookings */}
        <div className="overflow-hidden rounded-2xl border border-[#e3d8c8] bg-white">
          <div className="flex items-center justify-between border-b border-[#eee5d9] px-5 py-4">
            <div>
              <h3 className="font-serif text-xl text-[#4a1720]">हाल की टिकट बुकिंग</h3>
              <p className="mt-0.5 text-xs text-[#9b8880]">नवीनतम 5 बुकिंग</p>
            </div>
            <button onClick={() => onNav("bookings")}
              className="text-xs font-semibold text-[#8b2635] hover:underline">
              सभी देखें →
            </button>
          </div>
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-10 text-[#8d7971]">
              <LoaderCircle size={18} className="animate-spin" />
            </div>
          ) : recentBookings.length === 0 ? (
            <p className="py-10 text-center text-sm text-[#9b8880]">कोई डेटा नहीं।</p>
          ) : (
            <div className="divide-y divide-[#f0e9df]">
              {recentBookings.map((r) => (
                <div key={r._id} className="flex items-center justify-between gap-3 px-5 py-3.5 hover:bg-[#fcfaf6]">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f3eee8] text-[#6b4a3e]">
                      <Ticket size={15} />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-bold text-[#8b2635]">{r.ticketNumber}</p>
                      <p className="truncate text-xs text-[#9b8880]">{r.contactName} · {formatVisitDate(r.visitDate)}</p>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-bold text-[#4a1720]">{rupee(r.amount)}</p>
                    <p className="text-xs text-[#9b8880]">{r.visitorCount} आगंतुक</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </section>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN ADMIN COMPONENT
═══════════════════════════════════════════════════════════ */
export default function Admin() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [activeSection, setActiveSection] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Firebase data
  const [members,     setMembers]     = useState([]);
  const [bookings,    setBookings]    = useState([]);
  const [liveConfig,  setLiveConfig]  = useState(null);
  const [loading,     setLoading]     = useState(false);
  const [lastFetch,   setLastFetch]   = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [mSnap, bSnap, lSnap] = await Promise.all([
        getDocs(query(collection(db, "memberships"),   orderBy("submittedAt", "desc"))),
        getDocs(query(collection(db, "tour_bookings"), orderBy("issuedAt",    "desc"))),
        getDoc(doc(db, "live_darshan", "config")),
      ]);
      setMembers(mSnap.docs.map((d) => ({ _id: d.id, ...d.data() })));
      setBookings(bSnap.docs.map((d) => ({ _id: d.id, ...d.data() })));
      if (lSnap.exists()) setLiveConfig(lSnap.data());
      setLastFetch(new Date());
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (loggedIn) fetchData();
  }, [loggedIn]);

  const navItems = [
    { id: "dashboard",   label: "डैशबोर्ड",    icon: LayoutDashboard },
    { id: "memberships", label: "सदस्यता",       icon: Users,        count: members.length  },
    { id: "bookings",    label: "भ्रमण बुकिंग", icon: Ticket,       count: bookings.length },
    { id: "livedarshan", label: "लाइव दर्शन",   icon: MonitorPlay },
  ];

  if (!loggedIn) return <LoginScreen onLogin={() => setLoggedIn(true)} />;

  return (
    <div className="min-h-screen bg-[#f5f1ea] text-[#3b2925]">

      {/* Mobile overlay */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="मेनू बंद करें"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-[#241114]/50 backdrop-blur-sm md:hidden"
        />
      )}

      {/* ── Sidebar ── */}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-[#35151c] text-white transition-transform duration-300
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}>

        {/* Logo */}
        <div className="flex h-20 shrink-0 items-center gap-3 border-b border-white/10 px-5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#e4bb5b]/50 bg-[#4a1720]">
            <img src="/images/logo/logo.png" alt="" className="h-full w-full object-contain" />
          </div>
          <div>
            <p className="font-serif text-lg text-[#fffaf2]">कैलाश धाम</p>
            <p className="text-[10px] tracking-widest text-[#e4bb5b]">ADMIN PANEL</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="mt-6 flex-1 space-y-1 px-4">
          <p className="mb-3 px-2 text-[10px] font-semibold tracking-widest text-white/35">मुख्य मेनू</p>
          {navItems.map(({ id, label, icon: Icon, count }) => {
            const active = activeSection === id;
            return (
              <button key={id} type="button"
                onClick={() => { setActiveSection(id); setSidebarOpen(false); }}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-3 text-sm transition-all
                  ${active ? "bg-[#e4bb5b] font-semibold text-[#35151c]" : "text-white/65 hover:bg-white/7 hover:text-white"}`}>
                <span className="flex items-center gap-3">
                  <Icon size={18} />
                  {label}
                </span>
                {count > 0 && (
                  <span className={`rounded-full px-2 py-0.5 text-[10px] ${active ? "bg-[#35151c]/15" : "bg-white/10 text-white/60"}`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-white/10 p-4">
          {lastFetch && (
            <p className="mb-2 text-[10px] text-white/30">
              अंतिम अपडेट: {lastFetch.toLocaleTimeString("hi-IN")}
            </p>
          )}
          <button onClick={fetchData} disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 py-2 text-xs text-white/50 transition hover:bg-white/10 disabled:opacity-40">
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            डेटा ताज़ा करें
          </button>
          <div className="mt-4 flex items-center gap-2 text-xs text-white/30">
            <ShieldCheck size={13} />
            सुरक्षित व्यवस्थापन
          </div>
        </div>
      </aside>

      {/* ── Mobile toggle ── */}
      <button type="button"
        onClick={() => setSidebarOpen((v) => !v)}
        aria-label="मेनू"
        className="fixed left-4 top-4 z-[60] flex h-10 w-10 items-center justify-center rounded-xl border border-[#e3d8c8] bg-[#fffaf2] text-[#4a1720] shadow-sm lg:hidden">
        {sidebarOpen ? <X size={18} /> : <span className="text-lg leading-none">☰</span>}
      </button>

      {/* ── Main content ── */}
      <div className="min-h-screen pl-0 lg:pl-64">
        {/* Topbar */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-[#e3d8c8] bg-[#f5f1ea]/90 px-5 py-4 backdrop-blur-md lg:px-8">
          <div className="pl-12 lg:pl-0">
            <h1 className="font-serif text-xl text-[#4a1720]">
              {navItems.find((n) => n.id === activeSection)?.label || "डैशबोर्ड"}
            </h1>
            <p className="text-xs text-[#9b8880]">श्री कैलाश धाम मंदिर</p>
          </div>
          <div className="flex items-center gap-3">
            {loading && <LoaderCircle size={18} className="animate-spin text-[#8b2635]" />}
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e4bb5b] text-[#4a1720]">
              <BadgeCheck size={18} />
            </div>
          </div>
        </header>

        {/* Page body */}
        <main className="p-4 sm:p-6 lg:p-8">
          {activeSection === "dashboard" && (
            <DashboardSection
              members={members} bookings={bookings}
              loading={loading} onNav={setActiveSection}
            />
          )}
          {activeSection === "memberships" && (
            <MembershipsSection data={members} loading={loading} />
          )}
          {activeSection === "bookings" && (
            <TourBookingsSection data={bookings} loading={loading} />
          )}
          {activeSection === "livedarshan" && (
            <LiveDarshanSection
              config={liveConfig}
              onSave={(cfg) => setLiveConfig(cfg)}
            />
          )}
        </main>
      </div>
    </div>
  );
}
