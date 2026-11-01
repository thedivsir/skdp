import { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  CalendarDays,
  Clock3,
  ExternalLink,
  Heart,
  LoaderCircle,
  MapPin,
  MonitorPlay,
  Radio,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../config/firebase";

/* ─────────────────────────────────────────────────────────
   Helpers
───────────────────────────────────────────────────────── */

function getYouTubeVideoId(url = "") {
  if (!url) return null;
  try {
    const parsed = new URL(url.trim());
    const host = parsed.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      return parsed.pathname.split("/").filter(Boolean)[0] || null;
    }

    if (
      host === "youtube.com" ||
      host === "m.youtube.com" ||
      host === "youtube-nocookie.com"
    ) {
      // watch?v=VIDEO_ID
      if (parsed.searchParams.get("v")) {
        return parsed.searchParams.get("v");
      }
      const parts = parsed.pathname.split("/").filter(Boolean);
      // /live/VIDEO_ID  /embed/VIDEO_ID  /shorts/VIDEO_ID  /v/VIDEO_ID
      if (["live", "embed", "shorts", "v", "e"].includes(parts[0]) && parts[1]) {
        return parts[1];
      }
    }
  } catch {
    return null;
  }
  return null;
}

/* YouTube URL se embed src banao — video ID ho ya na ho */
function getYouTubeEmbedSrc(url = "") {
  if (!url) return null;
  const videoId = getYouTubeVideoId(url.trim());
  if (videoId) {
    return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=0&rel=0`;
  }
  // Channel live / handle URL — use as-is with nocookie embed trick
  // e.g. https://www.youtube.com/@SKDM/live  → not embeddable directly
  // Fallback: try to make a standard embed from the raw URL
  try {
    const parsed = new URL(url.trim());
    const host = parsed.hostname.replace(/^www\./, "");
    if (host === "youtube.com" || host === "m.youtube.com") {
      const parts = parsed.pathname.split("/").filter(Boolean);
      // /@handle/live  or /channel/ID/live
      if (parts[parts.length - 1] === "live") {
        // Channel live streams can be embedded via channel ID but not handle
        // Best fallback: show a direct link button instead
        return null;
      }
    }
  } catch {
    return null;
  }
  return null;
}

function formatUpdatedAt(value) {
  if (!value) return null;
  let date;
  if (value?.toDate) date = value.toDate();
  else date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("hi-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

const DEFAULT_TITLE = "श्री कैलाश धाम मंदिर — लाइव दर्शन";

/* ─────────────────────────────────────────────────────────
   Component
───────────────────────────────────────────────────────── */

export default function LiveDarshan() {
  const [stream,     setStream]     = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error,      setError]      = useState(false);

  /* Fetch config from Firestore live_darshan/config */
  const loadStream = useCallback(async (manual = false) => {
    if (manual) setRefreshing(true);
    else        setLoading(true);

    try {
      const snap = await getDoc(doc(db, "live_darshan", "config"));
      if (snap.exists()) {
        setStream(snap.data());
      } else {
        setStream({ status: "offline", videoUrl: "", title: DEFAULT_TITLE });
      }
      setError(false);
    } catch (err) {
      // Firestore fail hone par bhi offline dikhao, error screen nahi
      setStream({ status: "offline", videoUrl: "", title: DEFAULT_TITLE });
      setError(false);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadStream();
    // Poll every 60s to pick up admin updates
    const id = window.setInterval(() => loadStream(), 60_000);
    return () => window.clearInterval(id);
  }, [loadStream]);

  const videoId   = getYouTubeVideoId(stream?.videoUrl || "");
  const embedSrc  = getYouTubeEmbedSrc(stream?.videoUrl || "");
  const status    = stream?.status || "offline";
  const updatedAt = formatUpdatedAt(stream?.updatedAt);

  // Show video if: status is live/upcoming AND we have either an embed URL or a direct URL
  const hasVideo  = Boolean(embedSrc || stream?.videoUrl);
  const isLive    = (status === "live" || status === "upcoming") && hasVideo;

  const statusText = {
    live:     "लाइव दर्शन उपलब्ध",
    upcoming: "दर्शन शीघ्र प्रारंभ होगा",
    offline:  "वर्तमान में लाइव दर्शन उपलब्ध नहीं",
  }[status] ?? "वर्तमान में लाइव दर्शन उपलब्ध नहीं";

  /* ── Render ── */
  return (
    <main className="min-h-screen bg-[#fbf7ef] text-[#30201d]">

      {/* ── Hero ── */}
      <section className="relative isolate overflow-hidden bg-[#4a101c]">
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle at 15% 20%, #e8bd69 0, transparent 28%), radial-gradient(circle at 85% 80%, #a65b39 0, transparent 32%)",
          }}
        />
        <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#d7b46b]/40 bg-white/5 px-4 py-2 text-sm text-[#f2d99d]">
              <Sparkles size={16} />
              आस्था • भक्ति • दिव्य दर्शन
            </div>
            <h1 className="text-3xl font-bold leading-tight text-[#fff8e9] sm:text-5xl">
              लाइव दर्शन
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-[#f5e6d6] sm:text-lg">
              घर बैठे श्री कैलाश धाम मंदिर के दर्शन करें और
              प्रभु की भक्ति से अपने मन को जोड़ें।
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-3 text-sm text-[#f2d99d]">
              <span className="inline-flex items-center gap-2">
                <MapPin size={16} />
                खटंगिया, दौना रोड, जसरा, प्रयागराज
              </span>
            </div>
          </div>
        </div>
        <div className="h-1 bg-gradient-to-r from-[#9a632c] via-[#f0d18b] to-[#9a632c]" />
      </section>

      {/* ── Player + Info ── */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">

          {/* Player area */}
          <div className="min-w-0">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-[#93672d]">श्री कैलाश धाम मंदिर</p>
                <h2 className="mt-1 text-xl font-bold sm:text-2xl">
                  {stream?.title || DEFAULT_TITLE}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => loadStream(true)}
                disabled={loading || refreshing}
                className="inline-flex items-center gap-2 rounded-lg border border-[#e6d9c5] bg-white px-4 py-2.5 text-sm font-semibold text-[#5a2028] transition hover:border-[#a77936] hover:bg-[#fffaf1] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
                रिफ्रेश करें
              </button>
            </div>

            {/* Video box */}
            <div className="overflow-hidden rounded-2xl border border-[#e8ddca] bg-[#1c1514] shadow-[0_18px_55px_-28px_rgba(74,16,28,0.5)]">
              <div className="relative aspect-video w-full">
                {loading ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-4 text-center text-[#f5e6d6]">
                    <LoaderCircle size={36} className="animate-spin text-[#e8bd69]" />
                    <p>लाइव दर्शन की जानकारी प्राप्त की जा रही है…</p>
                  </div>
                ) : isLive && embedSrc ? (
                  /* Embeddable YouTube URL */
                  <iframe
                    key={embedSrc}
                    src={embedSrc}
                    title={stream?.title || DEFAULT_TITLE}
                    className="absolute inset-0 h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                ) : isLive && !embedSrc ? (
                  /* URL exists but can't be embedded (channel live) — show open button */
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-5 text-center text-[#f8eee0]">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[#e8bd69]/40 bg-[#e8bd69]/10 text-[#e8bd69]">
                      <MonitorPlay size={30} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">लाइव दर्शन उपलब्ध है</h3>
                      <p className="mt-2 text-sm text-[#e9d9c7]">
                        YouTube पर सीधे देखने के लिए नीचे क्लिक करें।
                      </p>
                    </div>
                    <a
                      href={stream.videoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-6 py-3 font-bold text-white transition hover:bg-red-700"
                    >
                      <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
                      YouTube पर देखें <ExternalLink size={16} />
                    </a>
                  </div>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center px-5 py-8 text-center text-[#f8eee0]">
                    <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-[#e8bd69]/40 bg-[#e8bd69]/10 text-[#e8bd69]">
                      {error ? (
                        <AlertCircle size={30} />
                      ) : status === "upcoming" ? (
                        <Clock3 size={30} />
                      ) : (
                        <MonitorPlay size={30} />
                      )}
                    </div>
                    <h3 className="text-xl font-bold">
                      {error
                        ? "जानकारी अभी उपलब्ध नहीं है"
                        : status === "upcoming"
                        ? "दर्शन शीघ्र प्रारंभ होगा"
                        : "अभी लाइव दर्शन उपलब्ध नहीं है"}
                    </h3>
                    <p className="mt-3 max-w-md text-sm leading-7 text-[#e9d9c7]">
                      {error
                        ? "कृपया कुछ समय बाद पुनः प्रयास करें।"
                        : status === "upcoming"
                        ? "लाइव प्रसारण शुरू होने पर यहाँ दर्शन कर सकेंगे।"
                        : "मंदिर का अगला लाइव लिंक उपलब्ध होते ही यहाँ दिखाया जाएगा।"}
                    </p>
                    {stream?.videoUrl && status !== "offline" && (
                      <a
                        href={stream.videoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#e8bd69] px-5 py-3 text-sm font-bold text-[#42131b] transition hover:bg-[#f3d38c]"
                      >
                        YouTube पर देखें <ExternalLink size={16} />
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Status bar */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#e8ddca] bg-white p-4">
              <div className="flex items-center gap-3">
                <span className={`flex h-10 w-10 items-center justify-center rounded-full ${
                  isLive ? "bg-red-50 text-red-600" : "bg-[#f7efdf] text-[#93672d]"
                }`}>
                  <Radio size={20} />
                </span>
                <div>
                  <p className="font-semibold">{statusText}</p>
                  <p className="mt-1 text-xs text-[#78675d]">
                    {updatedAt
                      ? `अंतिम अपडेट: ${updatedAt}`
                      : "मंदिर प्रशासन द्वारा अपडेट किया जाएगा"}
                  </p>
                </div>
              </div>
              {status === "live" && (
                <span className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-red-600" />
                  LIVE
                </span>
              )}
            </div>
          </div>

          {/* Sidebar info */}
          <aside className="space-y-5">
            <div className="rounded-2xl border border-[#e8ddca] bg-white p-5 sm:p-6">
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f7efdf] text-[#8d642c]">
                  <CalendarDays size={22} />
                </span>
                <div>
                  <h3 className="font-bold">दर्शन संबंधी जानकारी</h3>
                  <p className="mt-1 text-xs text-[#78675d]">लाइव प्रसारण की स्थिति</p>
                </div>
              </div>
              <div className="space-y-3 border-t border-[#eee4d5] pt-4 text-sm">
                <div className="flex items-start justify-between gap-3">
                  <span className="text-[#78675d]">वर्तमान स्थिति</span>
                  <span className="text-right font-semibold">
                    {loading ? "लोड हो रहा है…" : statusText}
                  </span>
                </div>
                <div className="flex items-start justify-between gap-3">
                  <span className="text-[#78675d]">प्रसारण माध्यम</span>
                  <span className="font-semibold">YouTube</span>
                </div>
                <div className="flex items-start justify-between gap-3">
                  <span className="text-[#78675d]">लाइव लिंक</span>
                  <span className="text-right font-semibold">
                    {videoId ? "उपलब्ध" : "प्रतीक्षारत"}
                  </span>
                </div>
              </div>
              <p className="mt-4 rounded-lg bg-[#fbf7ef] p-3 text-xs leading-6 text-[#78675d]">
                प्रसारण का समय और उपलब्धता मंदिर प्रशासन द्वारा
                अपडेट की गई जानकारी पर निर्भर करेगी।
              </p>
            </div>

            <div className="rounded-2xl bg-[#4a101c] p-5 text-[#fff8e9] sm:p-6">
              <Heart size={25} className="text-[#e8bd69]" />
              <h3 className="mt-4 text-lg font-bold">श्रद्धा और भक्ति से जुड़ें</h3>
              <p className="mt-2 text-sm leading-7 text-[#f0dfce]">
                प्रभु के स्मरण, प्रार्थना और सकारात्मक विचारों के साथ
                अपने दिन की शुरुआत करें।
              </p>
              <div className="mt-4 h-px bg-[#e8bd69]/30" />
              <p className="mt-4 text-sm italic leading-7 text-[#f2d99d]">
                "श्रद्धा, विश्वास और भक्ति ही प्रभु से जुड़ने का मार्ग हैं।"
              </p>
            </div>

            <div className="rounded-2xl border border-[#e8ddca] bg-white p-5">
              <h3 className="font-bold">मंदिर में पधारें</h3>
              <p className="mt-2 flex items-start gap-2 text-sm leading-7 text-[#78675d]">
                <MapPin size={18} className="mt-1 shrink-0 text-[#93672d]" />
                खटंगिया, दौना रोड, जसरा, प्रयागराज, उत्तर प्रदेश
              </p>
            </div>
          </aside>
        </div>
      </section>

      {/* ── Bottom devotional ── */}
      <section className="border-t border-[#e8ddca] bg-[#f4ead8]">
        <div className="mx-auto max-w-5xl px-4 py-12 text-center sm:px-6 sm:py-16">
          <Sparkles size={26} className="mx-auto text-[#93672d]" />
          <h2 className="mt-4 text-2xl font-bold text-[#4a101c] sm:text-3xl">
            हर क्षण प्रभु का स्मरण
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-8 text-[#66534a] sm:text-base">
            श्री कैलाश धाम मंदिर से जुड़े रहें। लाइव प्रसारण उपलब्ध
            न होने पर कृपया कुछ समय बाद इस पृष्ठ पर पुनः आएँ।
          </p>
        </div>
      </section>
    </main>
  );
}
