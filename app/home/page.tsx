"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Home, BookOpen, Bell, Users, Bot, MapPin, ChevronRight, Heart, BellOff } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
type PrayerTimes = {
  Fajr: string; Dhuhr: string; Asr: string; Maghrib: string; Isha: string;
  hijriDate: string; gregorianDate: string; city: string; province: string;
};

// ─── Constants ────────────────────────────────────────────────────────────────
const PRAYERS = [
  { name: "Subuh",   key: "Fajr"     as const, emoji: "🌙" },
  { name: "Dzuhur",  key: "Dhuhr"    as const, emoji: "☀️" },
  { name: "Ashar",   key: "Asr"      as const, emoji: "🌤️" },
  { name: "Maghrib", key: "Maghrib"  as const, emoji: "🌅" },
  { name: "Isya",    key: "Isha"     as const, emoji: "🌃" },
];

const MENU = [
  { href: "/quran",      emoji: "📖", label: "Al-Quran",   sub: "114 Surah",       action: "Baca",     bg: "linear-gradient(150deg,#1b7a46,#0e4525)" },
  { href: "/hadist",     emoji: "📜", label: "Hadist",     sub: "Shahih & Dhaif",  action: "Telusuri", bg: "linear-gradient(150deg,#b8860b,#7a5500)" },
  { href: "/organisasi", emoji: "🤝", label: "Organisasi", sub: "Struktur & Info", action: "Lihat",    bg: "linear-gradient(150deg,#1a5a8a,#0e3058)" },
  { href: "/kajian",     emoji: "🎤", label: "Kajian",     sub: "Jadwal & Video",  action: "Daftar",   bg: "linear-gradient(150deg,#5b2d8a,#30145c)" },
];

// Adzan Makkah CDN
const AZAN_SRC = "https://cdn.islamic.network/prayer-times/audio/Makkah/adhan.mp3";

// ─── Component ────────────────────────────────────────────────────────────────
export default function HomePage() {
  const [time, setTime]                     = useState("--:--");
  const [nextPrayer, setNextPrayer]         = useState("–");
  const [countdown, setCountdown]           = useState("00:00:00");
  const [nextPrayerTime, setNextPrayerTime] = useState("--:--");
  const [prayerTimes, setPrayerTimes]       = useState<PrayerTimes | null>(null);
  const [activePrayerKey, setActivePrayerKey] = useState("");
  const [pressed, setPressed]               = useState<string | null>(null);

  // Adzan states
  const [azanOn, setAzanOn]         = useState(false);
  const [azanPlaying, setAzanPlaying] = useState(false);
  const [azanPrayer, setAzanPrayer] = useState("");
  const audioRef                     = useRef<HTMLAudioElement | null>(null);
  const firedRef                     = useRef<Set<string>>(new Set());

  /* ── clock ── */
  useEffect(() => {
    const tick = () =>
      setTime(new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  /* ── fetch prayer ── */
  useEffect(() => {
    fetch("/api/prayer")
      .then((r) => r.json())
      .then(setPrayerTimes)
      .catch(console.error);
  }, []);

  /* ── countdown + azan trigger ── */
  useEffect(() => {
    if (!prayerTimes) return;
    const id = setInterval(() => {
      const now = new Date();
      const hh  = now.getHours(), mm = now.getMinutes(), ss = now.getSeconds();
      let found = false;

      for (const p of PRAYERS) {
        const [ph, pm] = prayerTimes[p.key].split(":").map(Number);
        const d = new Date(); d.setHours(ph); d.setMinutes(pm); d.setSeconds(0);
        if (d > now) {
          found = true;
          const diff = d.getTime() - now.getTime();
          setNextPrayer(p.name);
          setActivePrayerKey(p.key);
          setNextPrayerTime(prayerTimes[p.key]);
          const h2 = Math.floor(diff/3600000), m2 = Math.floor((diff%3600000)/60000), s2 = Math.floor((diff%60000)/1000);
          setCountdown(`${String(h2).padStart(2,"0")}:${String(m2).padStart(2,"0")}:${String(s2).padStart(2,"0")}`);
          break;
        }

        // 🔔 Azan trigger — tepat saat waktu sholat
        if (azanOn && ph === hh && pm === mm && ss === 0) {
          const key = `${p.key}-${now.toDateString()}`;
          if (!firedRef.current.has(key)) {
            firedRef.current.add(key);
            triggerAzan(p.name);
          }
        }
      }

      if (!found) {
        const [ph, pm] = prayerTimes.Fajr.split(":").map(Number);
        const d = new Date(); d.setDate(d.getDate()+1); d.setHours(ph); d.setMinutes(pm); d.setSeconds(0);
        const diff = d.getTime() - now.getTime();
        setNextPrayer("Subuh"); setActivePrayerKey("Fajr"); setNextPrayerTime(prayerTimes.Fajr);
        const h2 = Math.floor(diff/3600000), m2 = Math.floor((diff%3600000)/60000), s2 = Math.floor((diff%60000)/1000);
        setCountdown(`${String(h2).padStart(2,"0")}:${String(m2).padStart(2,"0")}:${String(s2).padStart(2,"0")}`);

        // check subuh azan
        if (azanOn && ph === hh && pm === mm && now.getSeconds() === 0) {
          const key = `Fajr-${now.toDateString()}`;
          if (!firedRef.current.has(key)) {
            firedRef.current.add(key);
            triggerAzan("Subuh");
          }
        }
      }
    }, 1000);
    return () => clearInterval(id);
  }, [prayerTimes, azanOn]);

  /* ── reset fired set tengah malam ── */
  useEffect(() => {
    const now  = new Date();
    const midnight = new Date(); midnight.setHours(24,0,0,0);
    const ms = midnight.getTime() - now.getTime();
    const t = setTimeout(() => { firedRef.current.clear(); }, ms);
    return () => clearTimeout(t);
  }, []);

  /* ── azan player ── */
  function triggerAzan(prayerName: string) {
    setAzanPrayer(prayerName);
    setAzanPlaying(true);

    // Notification
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(`🕌 Waktu ${prayerName}`, {
        body: "Allahu Akbar — saatnya sholat",
        silent: true,
      });
    }

    // Audio
    if (!audioRef.current) audioRef.current = new Audio(AZAN_SRC);
    audioRef.current.currentTime = 0;
    audioRef.current.volume = 0.9;
    audioRef.current.play().catch(() => setAzanPlaying(false));
    audioRef.current.onended = () => setAzanPlaying(false);
  }

  function stopAzan() {
    audioRef.current?.pause();
    if (audioRef.current) audioRef.current.currentTime = 0;
    setAzanPlaying(false);
  }

  /* ── toggle azan — minta notif permission ── */
  async function toggleAzan() {
    if (!azanOn && "Notification" in window && Notification.permission === "default") {
      await Notification.requestPermission();
    }
    setAzanOn((v) => !v);
  }

  const today = new Date().toLocaleDateString("id-ID", { day:"numeric", month:"long", year:"numeric" });

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700&family=Nunito:wght@400;500;600;700;800&family=Amiri:wght@400;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --g:     #166534;
          --g2:    #15803d;
          --gold:  #d4a732;
          --gold2: #f0c84e;
          --ink:   #0f1f0f;
          --bg:    #f0faf4;
          --radius: 22px;
        }
        html { -webkit-tap-highlight-color: transparent; }
        body { background: var(--bg); font-family: 'Nunito', sans-serif; color: var(--ink); }

        /* HERO */
        .hero {
          background: linear-gradient(160deg, #0c3d20 0%, #166534 45%, #14532d 100%);
          border-radius: 0 0 36px 36px;
          padding: 52px 20px 28px;
          position: relative; overflow: hidden;
          box-shadow: 0 12px 40px rgba(22,101,52,.35);
        }
        .hero::before {
          content:''; position:absolute; inset:0; pointer-events:none;
          background:
            radial-gradient(ellipse 70% 60% at 80% 20%, rgba(212,167,50,.12) 0%, transparent 70%),
            radial-gradient(ellipse 50% 50% at 10% 80%, rgba(34,197,94,.08) 0%, transparent 60%),
            repeating-conic-gradient(rgba(255,255,255,.015) 0deg 2deg, transparent 2deg 8deg);
        }
        .hero-ring {
          position:absolute; top:-50px; right:-50px;
          width:220px; height:220px; border-radius:50%;
          border:1px solid rgba(212,167,50,.18);
          box-shadow: 0 0 0 28px rgba(212,167,50,.06), 0 0 0 56px rgba(212,167,50,.03);
        }
        .basmala {
          font-family:'Amiri',serif; font-size:20px;
          color:rgba(212,167,50,.85); text-align:center;
          letter-spacing:3px; margin-bottom:18px;
        }
        .gold-line {
          height:1px; background:linear-gradient(90deg,transparent,rgba(212,167,50,.6),transparent);
          margin:0 auto 18px; width:70%;
        }
        .mosque-avatar {
          width:56px; height:56px; border-radius:18px; flex-shrink:0;
          background:rgba(212,167,50,.15); border:1px solid rgba(212,167,50,.35);
          display:flex; align-items:center; justify-content:center; font-size:26px;
        }
        .hero-clock {
          font-family:'Cinzel',serif; font-size:42px; font-weight:700;
          letter-spacing:-1px; line-height:1; color:#fff;
        }
        .hijri-badge {
          display:inline-flex; align-items:center; gap:5px;
          background:rgba(212,167,50,.2); border:1px solid rgba(212,167,50,.4);
          border-radius:30px; padding:3px 10px;
          font-size:10px; font-weight:700; color:var(--gold2);
          letter-spacing:.8px; text-transform:uppercase; margin-top:6px;
        }

        /* AZAN TOGGLE */
        .azan-toggle {
          display:flex; align-items:center; justify-content:space-between;
          background:rgba(255,255,255,.07); border:1px solid rgba(255,255,255,.1);
          border-radius:16px; padding:12px 16px; margin-top:14px;
          cursor:pointer; transition:all .2s; position:relative; z-index:1;
        }
        .azan-toggle:active { background:rgba(255,255,255,.12); }
        .toggle-pill {
          width:44px; height:24px; border-radius:12px;
          position:relative; transition:background .25s;
          flex-shrink:0;
        }
        .toggle-pill::after {
          content:''; position:absolute; top:3px; left:3px;
          width:18px; height:18px; border-radius:50%; background:#fff;
          transition:transform .25s cubic-bezier(.34,1.56,.64,1);
          box-shadow:0 1px 4px rgba(0,0,0,.3);
        }
        .toggle-pill.on { background:var(--gold); }
        .toggle-pill.on::after { transform:translateX(20px); }
        .toggle-pill.off { background:rgba(255,255,255,.2); }

        /* SECTION HEADER */
        .section-head {
          display:flex; align-items:center; gap:10px; margin:28px 0 14px; padding:0 2px;
        }
        .section-head span {
          font-size:11px; font-weight:800; letter-spacing:2px; text-transform:uppercase;
          color:var(--g2); white-space:nowrap;
        }
        .section-head::before { content:'✦'; color:var(--gold); font-size:10px; }
        .section-head::after  { content:'✦'; color:var(--gold); font-size:10px; }

        /* FEATURE GRID */
        .feat-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
        .feat-card {
          border-radius:var(--radius); padding:20px 12px 18px;
          display:flex; flex-direction:column; align-items:center; justify-content:center;
          text-align:center; text-decoration:none; position:relative; overflow:hidden;
          border:1px solid rgba(255,255,255,.1);
          transition:transform .15s ease, box-shadow .15s ease; cursor:pointer;
          -webkit-user-select:none; user-select:none;
        }
        .feat-card::before {
          content:''; position:absolute; top:0; left:0; right:0; height:1px;
          background:linear-gradient(90deg,transparent,rgba(255,255,255,.35),transparent);
        }
        .feat-card:active, .feat-card.pressed { transform:scale(.95); box-shadow:0 2px 12px rgba(0,0,0,.25); }
        .feat-emoji {
          font-size:32px; line-height:1; display:flex; align-items:center; justify-content:center;
          width:60px; height:60px; border-radius:18px;
          background:rgba(255,255,255,.12); border:1px solid rgba(255,255,255,.15);
          margin:0 auto 12px;
        }
        .feat-label { color:#fff; font-size:14px; font-weight:800; letter-spacing:-.2px; margin-bottom:3px; }
        .feat-sub   { color:rgba(255,255,255,.55); font-size:11px; font-weight:500; margin-bottom:10px; }
        .feat-action {
          display:inline-flex; align-items:center; gap:2px;
          background:rgba(255,255,255,.15); border-radius:20px; padding:4px 10px;
          font-size:11px; font-weight:700; color:rgba(255,255,255,.85);
        }

        /* PRAYER CARD */
        .prayer-card {
          background:linear-gradient(155deg,#0a3318 0%,#155e30 50%,#0d4020 100%);
          border-radius:var(--radius); padding:24px 20px;
          border:1px solid rgba(212,167,50,.22);
          box-shadow:0 16px 48px rgba(10,51,24,.3);
          position:relative; overflow:hidden;
        }
        .prayer-card::before {
          content:''; position:absolute; top:-40px; right:-40px;
          width:160px; height:160px; border-radius:50%;
          border:1px solid rgba(212,167,50,.12);
          box-shadow:0 0 0 30px rgba(212,167,50,.05),0 0 0 60px rgba(212,167,50,.02);
          pointer-events:none;
        }
        .prayer-next-highlight {
          background:linear-gradient(90deg,rgba(212,167,50,.18),rgba(212,167,50,.07));
          border:1px solid rgba(212,167,50,.3); border-radius:16px;
          padding:14px 16px; display:flex; align-items:center; justify-content:space-between;
          margin:14px 0;
        }
        .countdown-chip {
          background:rgba(0,0,0,.3); border:1px solid rgba(212,167,50,.25);
          border-radius:12px; padding:8px 14px; text-align:center; backdrop-filter:blur(6px);
        }
        .prayer-row-item {
          display:flex; align-items:center; justify-content:space-between;
          padding:9px 0; border-bottom:1px solid rgba(255,255,255,.06); transition:all .2s;
        }
        .prayer-row-item:last-child { border-bottom:none; }
        .prayer-row-item.active {
          background:rgba(212,167,50,.12); border-radius:12px;
          padding:9px 12px; margin:0 -12px; border-bottom:none;
        }
        .kiblat-btn {
          width:100%; margin-top:18px; padding:14px; border-radius:16px;
          background:linear-gradient(90deg,var(--gold),var(--gold2));
          color:#3a1f00; font-family:'Nunito',sans-serif;
          font-size:13px; font-weight:800; border:none; cursor:pointer;
          display:flex; align-items:center; justify-content:center; gap:6px;
          transition:opacity .15s, transform .1s;
        }
        .kiblat-btn:active { opacity:.85; transform:scale(.98); }

        /* DONASI BANNER */
        .donasi-banner {
          background:linear-gradient(135deg,#7a0e2a,#c0152f 50%,#8a0a20);
          border-radius:var(--radius); padding:20px;
          border:1px solid rgba(255,255,255,.12);
          box-shadow:0 8px 28px rgba(122,14,42,.3);
          display:flex; align-items:center; justify-content:space-between;
          text-decoration:none; position:relative; overflow:hidden;
          transition:transform .15s;
        }
        .donasi-banner:active { transform:scale(.98); }
        .donasi-banner::before {
          content:''; position:absolute; top:-30px; right:-30px;
          width:110px; height:110px; border-radius:50%;
          border:1px solid rgba(255,255,255,.08);
          box-shadow:0 0 0 22px rgba(255,255,255,.03);
          pointer-events:none;
        }
        .donasi-icon {
          width:52px; height:52px; border-radius:16px; flex-shrink:0;
          background:rgba(255,255,255,.12); border:1px solid rgba(255,255,255,.15);
          display:flex; align-items:center; justify-content:center; font-size:24px;
        }
        .donasi-action {
          display:inline-flex; align-items:center; gap:4px;
          background:rgba(255,255,255,.15); border-radius:20px; padding:6px 12px;
          font-size:12px; font-weight:800; color:#fff; flex-shrink:0;
        }

        /* QUOTE */
        .quote-card {
          background:linear-gradient(145deg,#78490a,#c9881e,#8a5900);
          border-radius:var(--radius); padding:22px 20px; position:relative; overflow:hidden;
          border:1px solid rgba(255,255,255,.12);
          box-shadow:0 8px 28px rgba(120,73,10,.25);
        }
        .quote-card::after {
          content:'❝'; position:absolute; bottom:-18px; right:12px;
          font-size:100px; color:rgba(255,255,255,.06); line-height:1; pointer-events:none;
        }

        /* KAJIAN */
        .kajian-card {
          background:linear-gradient(145deg,#2d1069,#4a2090 60%,#1e0848);
          border:1px solid rgba(212,167,50,.2); border-radius:var(--radius); padding:20px;
          position:relative; overflow:hidden;
          box-shadow:0 8px 28px rgba(45,16,105,.3);
        }
        .kajian-card::before {
          content:''; position:absolute; top:-30px; right:-30px;
          width:110px; height:110px; border-radius:50%;
          border:1px solid rgba(212,167,50,.12);
          box-shadow:0 0 0 22px rgba(212,167,50,.05); pointer-events:none;
        }

        /* AI BANNER */
        .ai-banner {
          background:#fff; border:1px solid rgba(22,101,52,.15);
          border-radius:var(--radius); padding:16px 18px;
          display:flex; align-items:center; justify-content:space-between;
          text-decoration:none; box-shadow:0 4px 16px rgba(0,0,0,.06);
          transition:transform .15s;
        }
        .ai-banner:active { transform:scale(.98); }
        .ai-icon {
          width:44px; height:44px; border-radius:14px;
          background:linear-gradient(135deg,rgba(22,101,52,.12),rgba(22,101,52,.06));
          border:1px solid rgba(22,101,52,.18);
          display:flex; align-items:center; justify-content:center; flex-shrink:0;
        }

        /* BOTTOM NAV */
        .bottom-nav {
          position:fixed; bottom:0; left:0; right:0;
          background:rgba(255,255,255,.96); backdrop-filter:blur(16px);
          border-top:1px solid rgba(22,101,52,.1);
          box-shadow:0 -8px 32px rgba(0,0,0,.07); z-index:100;
          padding-bottom:env(safe-area-inset-bottom,0);
        }
        .bottom-nav-inner {
          max-width:480px; margin:0 auto;
          display:flex; align-items:center; justify-content:space-around;
          padding:10px 8px 12px;
        }
        .nav-tab {
          display:flex; flex-direction:column; align-items:center; gap:3px;
          font-size:10px; font-weight:700; letter-spacing:.3px;
          text-decoration:none; min-width:52px; transition:transform .12s;
        }
        .nav-tab:active { transform:scale(.88); }
        .nav-tab.active { color:var(--g2); }
        .nav-tab:not(.active) { color:#9ca3af; }
        .nav-dot { width:4px; height:4px; border-radius:50%; background:var(--gold); margin-top:2px; }

        /* AZAN ALERT */
        .azan-alert {
          position:fixed; top:0; left:0; right:0; z-index:200;
          background:linear-gradient(135deg,#0a3318,#166534);
          border-bottom:2px solid rgba(212,167,50,.4);
          padding:env(safe-area-inset-top,20px) 20px 16px;
          box-shadow:0 8px 32px rgba(0,0,0,.4);
          animation:slideDown .4s cubic-bezier(.34,1.2,.64,1) both;
          display:flex; align-items:center; justify-content:space-between; gap:12px;
        }
        @keyframes slideDown {
          from { transform:translateY(-100%); opacity:0; }
          to   { transform:translateY(0); opacity:1; }
        }
        .stop-azan-btn {
          background:rgba(212,167,50,.2); border:1px solid rgba(212,167,50,.4);
          border-radius:12px; padding:8px 14px;
          color:var(--gold2); font-family:'Nunito',sans-serif;
          font-size:12px; font-weight:800; cursor:pointer; flex-shrink:0;
          transition:all .15s;
        }
        .stop-azan-btn:active { background:rgba(212,167,50,.35); }

        /* ANIMATIONS */
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(16px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes pulseDot {
          0%,100% { opacity:1; transform:scale(1); }
          50%      { opacity:.5; transform:scale(.7); }
        }
        .anim-1 { animation:fadeUp .4s ease both; }
        .anim-2 { animation:fadeUp .4s .08s ease both; }
        .anim-3 { animation:fadeUp .4s .16s ease both; }
        .anim-4 { animation:fadeUp .4s .24s ease both; }
        .anim-5 { animation:fadeUp .4s .32s ease both; }
        .anim-6 { animation:fadeUp .4s .40s ease both; }
        .anim-7 { animation:fadeUp .4s .48s ease both; }
        .live-dot {
          width:7px; height:7px; border-radius:50%; background:var(--gold2);
          animation:pulseDot 1.8s ease-in-out infinite; flex-shrink:0;
        }
        @keyframes pulseRed {
          0%,100% { opacity:1; } 50% { opacity:.5; }
        }
        .azan-dot {
          width:8px; height:8px; border-radius:50%; background:var(--gold2);
          animation:pulseRed 1s ease-in-out infinite; flex-shrink:0;
        }
      `}</style>

      {/* ── AZAN ALERT BANNER ── */}
      {azanPlaying && (
        <div className="azan-alert">
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <div className="azan-dot" />
            <div>
              <p style={{ fontSize:11, color:"rgba(212,167,50,.7)", fontWeight:700, textTransform:"uppercase", letterSpacing:"1px" }}>
                Allahu Akbar
              </p>
              <p style={{ fontSize:16, fontWeight:800, color:"#fff" }}>
                Waktu {azanPrayer} telah tiba 🕌
              </p>
            </div>
          </div>
          <button className="stop-azan-btn" onClick={stopAzan}>⏹ Stop</button>
        </div>
      )}

      <main style={{ minHeight:"100vh", paddingBottom:96, paddingTop: azanPlaying ? 80 : 0 }}>

        {/* ── HERO ── */}
        <div className="hero anim-1">
          <div className="hero-ring" />
          <div style={{ maxWidth:480, margin:"0 auto", position:"relative", zIndex:1 }}>
            <p className="basmala">بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ</p>
            <div className="gold-line" />
            <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:12 }}>
              <div style={{ display:"flex", alignItems:"center", gap:14, flex:1, minWidth:0 }}>
                <div className="mosque-avatar">🕌</div>
                <div style={{ minWidth:0 }}>
                  <p style={{ fontSize:10, fontWeight:800, letterSpacing:"1.5px", textTransform:"uppercase", color:"rgba(212,167,50,.7)", marginBottom:3 }}>
                    Assalamu'alaikum
                  </p>
                  <h1 style={{ fontFamily:"'Cinzel',serif", fontSize:17, fontWeight:700, color:"#fff", lineHeight:1.25, marginBottom:4 }}>
                    Jami' Nuril Anwar
                  </h1>
                  <div style={{ display:"flex", alignItems:"center", gap:4 }}>
                    <MapPin size={11} color="rgba(212,167,50,.7)" />
                    <span style={{ fontSize:11, color:"rgba(255,255,255,.55)" }}>Karawang, Jawa Barat</span>
                  </div>
                  <div className="hijri-badge">⭐ 1447 H</div>
                </div>
              </div>
              <div style={{ textAlign:"right", flexShrink:0 }}>
                <div className="hero-clock">{time}</div>
                <p style={{ fontSize:11, color:"rgba(255,255,255,.5)", marginTop:4 }}>{today}</p>
              </div>
            </div>

            {/* ── AZAN TOGGLE ── */}
            <div className="azan-toggle" onClick={toggleAzan}>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                {azanOn
                  ? <Bell size={16} color="var(--gold2)" />
                  : <BellOff size={16} color="rgba(255,255,255,.4)" />}
                <div>
                  <p style={{ fontSize:13, fontWeight:800, color: azanOn ? "#fff" : "rgba(255,255,255,.5)" }}>
                    Notifikasi Adzan
                  </p>
                  <p style={{ fontSize:10, color:"rgba(255,255,255,.35)", marginTop:1 }}>
                    {azanOn ? "Adzan Makkah aktif di semua waktu sholat" : "Ketuk untuk aktifkan adzan otomatis"}
                  </p>
                </div>
              </div>
              <div className={`toggle-pill ${azanOn ? "on" : "off"}`} />
            </div>
          </div>
        </div>

        {/* ── CONTENT ── */}
        <div style={{ maxWidth:480, margin:"0 auto", padding:"0 16px" }}>

          {/* MENU GRID */}
          <div className="anim-2">
            <div className="section-head"><span>Menu Utama</span></div>
            <div className="feat-grid">
              {MENU.map((item) => (
                <Link
                  key={item.href} href={item.href}
                  className={`feat-card${pressed === item.href ? " pressed" : ""}`}
                  style={{ background:item.bg }}
                  onMouseDown={() => setPressed(item.href)} onMouseUp={() => setPressed(null)}
                  onTouchStart={() => setPressed(item.href)} onTouchEnd={() => setPressed(null)}
                >
                  <div className="feat-emoji">{item.emoji}</div>
                  <p className="feat-label">{item.label}</p>
                  <p className="feat-sub">{item.sub}</p>
                  <div className="feat-action">{item.action} <ChevronRight size={11} /></div>
                </Link>
              ))}
            </div>
          </div>

          {/* PRAYER CARD */}
          <div className="anim-3">
            <div className="section-head"><span>Waktu Sholat</span></div>
            <div className="prayer-card">
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <div>
                  <p style={{ fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"1.5px", color:"rgba(212,167,50,.7)", marginBottom:2 }}>
                    Sholat Berikutnya
                  </p>
                  <p style={{ fontSize:26, fontWeight:800, color:"#fff" }}>{nextPrayer}</p>
                </div>
                <div className="countdown-chip">
                  <p style={{ fontSize:9, fontWeight:700, color:"rgba(212,167,50,.65)", textTransform:"uppercase", letterSpacing:"1px", marginBottom:3 }}>Countdown</p>
                  <p style={{ fontSize:20, fontWeight:800, color:"#fff", fontVariantNumeric:"tabular-nums", letterSpacing:"1px" }}>{countdown}</p>
                </div>
              </div>
              <div className="prayer-next-highlight">
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <div className="live-dot" />
                  <div>
                    <p style={{ fontSize:10, color:"rgba(255,255,255,.45)", marginBottom:2 }}>Segera</p>
                    <p style={{ fontSize:18, fontWeight:800, color:"#fff" }}>{nextPrayer}</p>
                  </div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <p style={{ fontSize:28, fontWeight:800, color:"var(--gold2)", fontVariantNumeric:"tabular-nums" }}>{nextPrayerTime}</p>
                  <p style={{ fontSize:10, color:"rgba(255,255,255,.4)", marginTop:1 }}>WIB</p>
                </div>
              </div>
              {PRAYERS.map((p) => {
                const isActive = activePrayerKey === p.key;
                return (
                  <div key={p.key} className={`prayer-row-item${isActive ? " active" : ""}`}>
                    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                      <span style={{ fontSize:16, width:22, textAlign:"center" }}>{p.emoji}</span>
                      <span style={{ fontSize:13, fontWeight: isActive ? 700 : 600, color: isActive ? "var(--gold2)" : "rgba(255,255,255,.65)" }}>
                        {p.name}
                      </span>
                    </div>
                    <span style={{ fontSize:13, fontWeight:700, color: isActive ? "var(--gold)" : "rgba(255,255,255,.45)", fontVariantNumeric:"tabular-nums" }}>
                      {prayerTimes ? prayerTimes[p.key] : "--:--"}
                    </span>
                  </div>
                );
              })}
              <Link href="/kiblat" style={{ textDecoration:"none" }}>
                <button className="kiblat-btn">🧭 Cek Arah Kiblat</button>
              </Link>
            </div>
          </div>

          {/* DONASI BANNER */}
          <div className="anim-4">
            <div className="section-head"><span>Donasi Masjid</span></div>
            <Link href="/donasi" className="donasi-banner">
              <div style={{ display:"flex", alignItems:"center", gap:14, position:"relative", zIndex:1 }}>
                <div className="donasi-icon">💝</div>
                <div>
                  <p style={{ fontSize:10, fontWeight:800, textTransform:"uppercase", letterSpacing:"1px", color:"rgba(255,255,255,.55)", marginBottom:3 }}>
                    Amal Jariyah
                  </p>
                  <p style={{ fontSize:16, fontWeight:800, color:"#fff" }}>Infaq shodaqoh</p>
                  <p style={{ fontSize:11, color:"rgba(255,255,255,.5)", marginTop:2 }}>
                    QRIS & Transfer Bank tersedia
                  </p>
                </div>
              </div>
              <div className="donasi-action" style={{ position:"relative", zIndex:1 }}>
                <Heart size={12} fill="currentColor" /> Donasi
              </div>
            </Link>
          </div>

          {/* QUOTE */}
          <div className="anim-5">
            <div className="section-head"><span>Inspirasi Hari Ini</span></div>
            <div className="quote-card">
              <p style={{ fontSize:10, fontWeight:800, textTransform:"uppercase", letterSpacing:"1.5px", color:"rgba(255,255,255,.5)", marginBottom:10 }}>
                ✦ Quote
              </p>
              <p style={{ fontFamily:"'Amiri',serif", fontSize:19, lineHeight:1.6, color:"#fff", position:"relative", zIndex:1 }}>
                "Apa yang kau cari sedang mencarimu."
              </p>
              <div style={{ height:1, background:"linear-gradient(90deg,transparent,rgba(255,255,255,.3),transparent)", margin:"14px 0 10px" }} />
              <p style={{ fontSize:12, color:"rgba(255,255,255,.6)", fontStyle:"italic" }}>— Jalaluddin Rumi</p>
            </div>
          </div>

          {/* KAJIAN */}
          <div className="anim-6">
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", margin:"28px 0 14px", padding:"0 2px" }}>
              <p style={{ fontSize:11, fontWeight:800, letterSpacing:"2px", textTransform:"uppercase", color:"var(--g2)" }}>✦ Kajian rutin</p>
            </div>
            <div className="kajian-card">
              <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", position:"relative", zIndex:1 }}>
                <div>
                  <div style={{ display:"inline-flex", alignItems:"center", gap:5, background:"rgba(212,167,50,.18)", border:"1px solid rgba(212,167,50,.3)", borderRadius:20, padding:"3px 10px", marginBottom:10 }}>
                    <span style={{ width:5, height:5, borderRadius:"50%", background:"var(--gold2)" }} />
                    <span style={{ fontSize:10, fontWeight:800, letterSpacing:".8px", textTransform:"uppercase", color:"var(--gold2)" }}>Rutin</span>
                  </div>
                  <h4 style={{ fontSize:20, fontWeight:800, color:"#fff", marginBottom:6 }}>Kajian rutin</h4>
                  <p style={{ fontSize:12, color:"rgba(255,255,255,.5)", marginBottom:3 }}>Ba'da Isya · Setiap Malam Senin</p>
                  <p style={{ fontSize:12, color:"rgba(255,255,255,.35)" }}></p>
                </div>
                <span style={{ fontSize:38 }}>🎓</span>
              </div>
            </div>
          </div>

          {/* AI BANNER */}
          <div className="anim-7" style={{ marginTop:16, marginBottom:8 }}>
            <Link href="/ai" className="ai-banner">
              <div style={{ display:"flex", alignItems:"center", gap:14 }}>
                <div className="ai-icon"><Bot size={20} color="var(--g2)" /></div>
                <div>
                  <p style={{ fontSize:14, fontWeight:800, color:"var(--ink)" }}>AI Islam</p>
                  <p style={{ fontSize:12, color:"#6b7280", marginTop:1 }}>Tanya apa saja tentang Islam</p>
                </div>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:4, color:"var(--g2)" }}>
                <span style={{ fontSize:12, fontWeight:700 }}>Mulai</span>
                <ChevronRight size={14} />
              </div>
            </Link>
          </div>

        </div>

        {/* ── BOTTOM NAV ── */}
        <div className="bottom-nav">
          <div className="bottom-nav-inner">
            {[
              { href:"/",           Icon:Home,     label:"Home",       active:true  },
              { href:"/quran",      Icon:BookOpen, label:"Quran",      active:false },
              { href:"/hadist",     Icon:Bell,     label:"Hadist",     active:false },
              { href:"/donasi",     Icon:Heart,    label:"Donasi",     active:false },
              { href:"/ai",         Icon:Bot,      label:"AI Islam",   active:false },
            ].map(({ href, Icon, label, active }) => (
              <Link key={href} href={href} className={`nav-tab${active ? " active" : ""}`}>
                <Icon size={21} />
                <span>{label}</span>
                {active && <div className="nav-dot" />}
              </Link>
            ))}
          </div>
        </div>

      </main>
    </>
  );
}