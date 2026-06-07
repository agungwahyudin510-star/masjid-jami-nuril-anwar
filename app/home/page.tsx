"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Home, BookOpen, Bell, Bot, MapPin, ChevronRight, Heart, BellOff } from "lucide-react";

type PrayerTimes = {
  Fajr: string; Dhuhr: string; Asr: string; Maghrib: string; Isha: string;
  hijriDate: string; gregorianDate: string; city: string; province: string;
};

const PRAYERS = [
  { name: "Subuh",   key: "Fajr"    as const, emoji: "🌙" },
  { name: "Dzuhur",  key: "Dhuhr"   as const, emoji: "☀️" },
  { name: "Ashar",   key: "Asr"     as const, emoji: "🌤️" },
  { name: "Maghrib", key: "Maghrib" as const, emoji: "🌅" },
  { name: "Isya",    key: "Isha"    as const, emoji: "🌃" },
];

const MENU = [
  { href: "/quran",      emoji: "📖", label: "Al-Quran",   sub: "114 Surah",       action: "Baca",     color: "#2ecc71", border: "rgba(46,204,113,.25)",  bg: "rgba(46,204,113,.08)" },
  { href: "/hadist",     emoji: "📜", label: "Hadist",     sub: "Shahih & Dhaif",  action: "Telusuri", color: "#c9a84c", border: "rgba(201,168,76,.25)",  bg: "rgba(201,168,76,.08)" },
  { href: "/organisasi", emoji: "🤝", label: "Organisasi", sub: "Struktur & Info", action: "Lihat",    color: "#3498db", border: "rgba(52,152,219,.25)",  bg: "rgba(52,152,219,.08)" },
  { href: "/pengumuman", emoji: "📢", label: "Pengumuman", sub: "Info & Kegiatan", action: "Lihat",    color: "#9b59b6", border: "rgba(155,89,182,.25)",  bg: "rgba(155,89,182,.08)" },
];

const AZAN_SRC = "https://cdn.islamic.network/prayer-times/audio/Makkah/adhan.mp3";

export default function HomePage() {
  const [time, setTime]                       = useState("--:--");
  const [nextPrayer, setNextPrayer]           = useState("–");
  const [countdown, setCountdown]             = useState("00:00:00");
  const [nextPrayerTime, setNextPrayerTime]   = useState("--:--");
  const [prayerTimes, setPrayerTimes]         = useState<PrayerTimes | null>(null);
  const [activePrayerKey, setActivePrayerKey] = useState("");
  const [pressed, setPressed]                 = useState<string | null>(null);
  const [azanPlaying, setAzanPlaying]         = useState(false);
  const [azanPrayer, setAzanPrayer]           = useState("");

  // ── Persistent azanOn dari localStorage ──
  const [azanOn, setAzanOn] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("azan-on") === "true";
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const firedRef = useRef<Set<string>>(new Set());

  // ── Init audio di mount supaya siap diplay ──
  useEffect(() => {
    audioRef.current = new Audio(AZAN_SRC);
    audioRef.current.preload = "auto";
    audioRef.current.load();
  }, []);

  // ── Clock ──
  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // ── Fetch prayer times ──
  useEffect(() => {
    fetch("/api/prayer").then(r => r.json()).then(setPrayerTimes).catch(console.error);
  }, []);

  // ── Countdown + azan trigger ──
  useEffect(() => {
    if (!prayerTimes) return;
    const id = setInterval(() => {
      const now = new Date();
      const hh = now.getHours(), mm = now.getMinutes(), ss = now.getSeconds();
      let found = false;

      for (const p of PRAYERS) {
        const [ph, pm] = prayerTimes[p.key].split(":").map(Number);
        const d = new Date(); d.setHours(ph); d.setMinutes(pm); d.setSeconds(0);
        if (d > now) {
          found = true;
          const diff = d.getTime() - now.getTime();
          setNextPrayer(p.name); setActivePrayerKey(p.key); setNextPrayerTime(prayerTimes[p.key]);
          const h2 = Math.floor(diff/3600000), m2 = Math.floor((diff%3600000)/60000), s2 = Math.floor((diff%60000)/1000);
          setCountdown(`${String(h2).padStart(2,"0")}:${String(m2).padStart(2,"0")}:${String(s2).padStart(2,"0")}`);
          break;
        }
        if (azanOn && ph === hh && pm === mm && ss === 0) {
          const key = `${p.key}-${now.toDateString()}`;
          if (!firedRef.current.has(key)) { firedRef.current.add(key); triggerAzan(p.name); }
        }
      }

      if (!found) {
        const [ph, pm] = prayerTimes.Fajr.split(":").map(Number);
        const d = new Date(); d.setDate(d.getDate()+1); d.setHours(ph); d.setMinutes(pm); d.setSeconds(0);
        const diff = d.getTime() - now.getTime();
        setNextPrayer("Subuh"); setActivePrayerKey("Fajr"); setNextPrayerTime(prayerTimes.Fajr);
        const h2 = Math.floor(diff/3600000), m2 = Math.floor((diff%3600000)/60000), s2 = Math.floor((diff%60000)/1000);
        setCountdown(`${String(h2).padStart(2,"0")}:${String(m2).padStart(2,"0")}:${String(s2).padStart(2,"0")}`);
        if (azanOn && ph === hh && pm === mm && now.getSeconds() === 0) {
          const key = `Fajr-${now.toDateString()}`;
          if (!firedRef.current.has(key)) { firedRef.current.add(key); triggerAzan("Subuh"); }
        }
      }
    }, 1000);
    return () => clearInterval(id);
  }, [prayerTimes, azanOn]);

  // ── Reset fired set tengah malam ──
  useEffect(() => {
    const now = new Date(); const midnight = new Date(); midnight.setHours(24,0,0,0);
    const t = setTimeout(() => { firedRef.current.clear(); }, midnight.getTime() - now.getTime());
    return () => clearTimeout(t);
  }, []);

  // ── Trigger azan ──
  function triggerAzan(prayerName: string) {
    setAzanPrayer(prayerName);
    setAzanPlaying(true);

    // Browser notification
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(`🕌 Waktu ${prayerName}`, { body: "Allahu Akbar — saatnya sholat", silent: true });
    }

    // Play audio
    try {
      if (!audioRef.current) {
        audioRef.current = new Audio(AZAN_SRC);
      }
      audioRef.current.currentTime = 0;
      audioRef.current.volume = 0.9;
      const play = audioRef.current.play();
      if (play !== undefined) {
        play
          .then(() => {
            audioRef.current!.onended = () => setAzanPlaying(false);
          })
          .catch(() => {
            // Autoplay diblokir — banner tetap tampil 8 detik
            setTimeout(() => setAzanPlaying(false), 8000);
          });
      }
    } catch {
      setTimeout(() => setAzanPlaying(false), 8000);
    }
  }

  function stopAzan() {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setAzanPlaying(false);
  }

  // ── Toggle azan — simpan ke localStorage ──
  async function toggleAzan() {
    if (!azanOn && "Notification" in window && Notification.permission === "default") {
      await Notification.requestPermission();
    }
    const newVal = !azanOn;
    setAzanOn(newVal);
    localStorage.setItem("azan-on", String(newVal));
  }

  const today = new Date().toLocaleDateString("id-ID", { day:"numeric", month:"long", year:"numeric" });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Playfair+Display:wght@600;700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        html{-webkit-tap-highlight-color:transparent;}
        body{background:#060f09;font-family:'Plus Jakarta Sans',sans-serif;color:#fff;}
        .bg-base{position:fixed;inset:0;background:radial-gradient(ellipse 100% 55% at 50% 0%,#0d2e18 0%,#060f09 60%);z-index:0;}
        .bg-pat{position:fixed;inset:0;opacity:.035;z-index:0;background-image:url("data:image/svg+xml,%3Csvg width='120' height='120' viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23c9a84c' stroke-width='0.6'%3E%3Cpolygon points='60,6 114,33 114,87 60,114 6,87 6,33'/%3E%3Cpolygon points='60,22 98,42 98,78 60,98 22,78 22,42'/%3E%3Cpolygon points='60,38 82,50 82,70 60,82 38,70 38,50'/%3E%3C/g%3E%3C/svg%3E");background-size:120px 120px;}
        .gold-bar{position:fixed;left:0;right:0;height:2px;z-index:10;background:linear-gradient(90deg,transparent,#b8962e 20%,#f0d080 50%,#b8962e 80%,transparent);}
        .bar-t{top:0;}.bar-b{bottom:0;}
        .hp-main{position:relative;z-index:1;min-height:100vh;padding-bottom:80px;}
        .content{max-width:480px;margin:0 auto;}
        @keyframes fadeDown{from{opacity:0;transform:translateY(-16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(.7)}}
        .hero{background:linear-gradient(160deg,#071a0e 0%,#0d2e18 40%,#091c13 100%);border-radius:0 0 32px 32px;padding:56px 20px 24px;position:relative;overflow:hidden;border-bottom:1px solid rgba(201,168,76,.15);box-shadow:0 16px 48px rgba(0,0,0,.5);animation:fadeDown .6s cubic-bezier(.22,1,.36,1) both;}
        .hero::before{content:'';position:absolute;inset:0;pointer-events:none;background:radial-gradient(ellipse 70% 60% at 80% 20%,rgba(201,168,76,.07) 0%,transparent 70%),radial-gradient(ellipse 50% 50% at 10% 80%,rgba(46,204,113,.05) 0%,transparent 60%);}
        .hero-ring{position:absolute;top:-60px;right:-60px;width:240px;height:240px;border-radius:50%;border:1px solid rgba(201,168,76,.1);box-shadow:0 0 0 32px rgba(201,168,76,.04),0 0 0 64px rgba(201,168,76,.02);pointer-events:none;}
        .basmala{font-family:'Amiri',serif;font-size:18px;color:rgba(201,168,76,.7);text-align:center;letter-spacing:2px;margin-bottom:16px;}
        .gold-line{height:1px;background:linear-gradient(90deg,transparent,rgba(201,168,76,.4),transparent);margin:0 auto 18px;width:60%;}
        .mosque-avatar{width:52px;height:52px;border-radius:16px;flex-shrink:0;background:rgba(201,168,76,.1);border:1px solid rgba(201,168,76,.25);display:flex;align-items:center;justify-content:center;font-size:24px;}
        .hero-clock{font-family:'Playfair Display',serif;font-size:40px;font-weight:700;letter-spacing:-1px;line-height:1;color:#fff;}
        .hijri-badge{display:inline-flex;align-items:center;gap:5px;background:rgba(201,168,76,.12);border:1px solid rgba(201,168,76,.25);border-radius:30px;padding:3px 10px;font-size:10px;font-weight:700;color:rgba(201,168,76,.8);letter-spacing:.8px;text-transform:uppercase;margin-top:6px;}
        .azan-toggle{display:flex;align-items:center;justify-content:space-between;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:14px;padding:12px 16px;margin-top:16px;cursor:pointer;transition:all .2s;}
        .azan-toggle:hover{background:rgba(255,255,255,.06);}
        .toggle-pill{width:42px;height:23px;border-radius:12px;position:relative;transition:background .25s;flex-shrink:0;}
        .toggle-pill::after{content:'';position:absolute;top:3px;left:3px;width:17px;height:17px;border-radius:50%;background:#fff;transition:transform .25s cubic-bezier(.34,1.56,.64,1);box-shadow:0 1px 4px rgba(0,0,0,.3);}
        .toggle-pill.on{background:#c9a84c;}.toggle-pill.on::after{transform:translateX(19px);}
        .toggle-pill.off{background:rgba(255,255,255,.18);}
        .sec-head{display:flex;align-items:center;gap:10px;margin:24px 0 14px;padding:0 20px;}
        .sec-line{flex:1;height:1px;}.sl{background:linear-gradient(90deg,transparent,rgba(201,168,76,.22));}.sr{background:linear-gradient(90deg,rgba(201,168,76,.22),transparent);}
        .sec-text{font-size:10px;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;color:rgba(201,168,76,.5);white-space:nowrap;}
        .feat-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;padding:0 20px;}
        .feat-card{border-radius:18px;padding:18px 14px 16px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;text-decoration:none;position:relative;overflow:hidden;border:1px solid;transition:all .18s;cursor:pointer;-webkit-user-select:none;user-select:none;}
        .feat-card::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(255,255,255,.15),transparent);}
        .feat-card:active,.feat-card.pressed{transform:scale(.95);}
        .feat-card:hover{transform:translateY(-2px);}
        .feat-emoji{font-size:28px;width:54px;height:54px;border-radius:16px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.1);display:flex;align-items:center;justify-content:center;margin:0 auto 10px;}
        .feat-label{font-size:13px;font-weight:700;color:#e8d8a0;margin-bottom:3px;}
        .feat-sub{font-size:10.5px;color:rgba(255,255,255,.4);margin-bottom:10px;}
        .feat-action{display:inline-flex;align-items:center;gap:3px;background:rgba(255,255,255,.1);border-radius:20px;padding:4px 10px;font-size:10.5px;font-weight:600;color:rgba(255,255,255,.7);}
        .prayer-card{margin:0 20px;background:rgba(255,255,255,.03);border:1px solid rgba(201,168,76,.15);border-radius:20px;padding:20px;position:relative;overflow:hidden;animation:fadeUp .6s .2s cubic-bezier(.22,1,.36,1) both;}
        .prayer-card::before{content:'';position:absolute;top:0;left:10%;right:10%;height:1px;background:linear-gradient(90deg,transparent,rgba(201,168,76,.3),transparent);}
        .prayer-highlight{background:linear-gradient(135deg,rgba(201,168,76,.1),rgba(201,168,76,.04));border:1px solid rgba(201,168,76,.2);border-radius:14px;padding:14px;display:flex;align-items:center;justify-content:space-between;margin:14px 0;}
        .countdown-box{background:rgba(0,0,0,.3);border:1px solid rgba(201,168,76,.2);border-radius:10px;padding:8px 12px;text-align:center;}
        .prayer-row{display:flex;align-items:center;justify-content:space-between;padding:9px 0;border-bottom:1px solid rgba(255,255,255,.05);}
        .prayer-row:last-of-type{border-bottom:none;}
        .prayer-row.active{background:rgba(201,168,76,.1);border-radius:10px;padding:9px 10px;margin:0 -10px;border-bottom:none;}
        .kiblat-btn{width:100%;margin-top:16px;padding:13px;border-radius:13px;background:linear-gradient(135deg,rgba(201,168,76,.2),rgba(201,168,76,.1));border:1px solid rgba(201,168,76,.3);color:#e8d8a0;font-family:'Plus Jakarta Sans',sans-serif;font-size:13px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;transition:all .2s;}
        .donasi-card{margin:0 20px;background:linear-gradient(135deg,#4a0e1a,#7a1228 50%,#3d0a15);border-radius:18px;padding:18px;border:1px solid rgba(255,100,130,.2);display:flex;align-items:center;justify-content:space-between;text-decoration:none;position:relative;overflow:hidden;transition:transform .2s;animation:fadeUp .6s .28s cubic-bezier(.22,1,.36,1) both;}
        .donasi-card:hover{transform:translateY(-2px);}
        .donasi-card::before{content:'';position:absolute;top:0;left:10%;right:10%;height:1px;background:linear-gradient(90deg,transparent,rgba(255,150,170,.2),transparent);}
        .donasi-icon{width:48px;height:48px;border-radius:14px;flex-shrink:0;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.12);display:flex;align-items:center;justify-content:center;font-size:22px;}
        .donasi-btn{display:inline-flex;align-items:center;gap:4px;background:rgba(255,255,255,.15);border-radius:20px;padding:6px 12px;font-size:11px;font-weight:700;color:#fff;flex-shrink:0;}
        .quote-card{margin:0 20px;background:linear-gradient(145deg,rgba(120,73,10,.6),rgba(100,60,5,.8));border-radius:18px;padding:20px;border:1px solid rgba(201,168,76,.2);position:relative;overflow:hidden;animation:fadeUp .6s .32s cubic-bezier(.22,1,.36,1) both;}
        .quote-card::before{content:'';position:absolute;top:0;left:10%;right:10%;height:1px;background:linear-gradient(90deg,transparent,rgba(201,168,76,.3),transparent);}
        .quote-card::after{content:'❝';position:absolute;bottom:-20px;right:12px;font-size:90px;color:rgba(255,255,255,.05);line-height:1;pointer-events:none;}
        .kajian-card{margin:0 20px;background:linear-gradient(145deg,rgba(45,16,105,.7),rgba(74,32,144,.5));border:1px solid rgba(155,89,182,.25);border-radius:18px;padding:18px;position:relative;overflow:hidden;animation:fadeUp .6s .36s cubic-bezier(.22,1,.36,1) both;}
        .kajian-card::before{content:'';position:absolute;top:0;left:10%;right:10%;height:1px;background:linear-gradient(90deg,transparent,rgba(155,89,182,.3),transparent);}
        .ai-card{margin:0 20px;background:rgba(255,255,255,.03);border:1px solid rgba(201,168,76,.12);border-radius:18px;padding:16px 18px;display:flex;align-items:center;justify-content:space-between;text-decoration:none;transition:all .2s;animation:fadeUp .6s .4s cubic-bezier(.22,1,.36,1) both;}
        .ai-card:hover{background:rgba(255,255,255,.05);border-color:rgba(201,168,76,.22);}
        .ai-icon{width:42px;height:42px;border-radius:13px;background:rgba(201,168,76,.1);border:1px solid rgba(201,168,76,.2);display:flex;align-items:center;justify-content:center;flex-shrink:0;}
        .bottom-nav{position:fixed;bottom:0;left:0;right:0;z-index:100;background:rgba(6,15,9,.92);backdrop-filter:blur(20px);border-top:1px solid rgba(201,168,76,.1);box-shadow:0 -8px 32px rgba(0,0,0,.4);padding-bottom:env(safe-area-inset-bottom,0);}
        .bottom-nav-inner{max-width:480px;margin:0 auto;display:flex;align-items:center;justify-content:space-around;padding:10px 8px 12px;}
        .nav-tab{display:flex;flex-direction:column;align-items:center;gap:3px;font-size:10px;font-weight:600;letter-spacing:.3px;text-decoration:none;min-width:52px;transition:transform .12s;}
        .nav-tab:active{transform:scale(.88);}
        .nav-tab.active{color:rgba(201,168,76,.9);}
        .nav-tab:not(.active){color:rgba(255,255,255,.25);}
        .nav-dot{width:4px;height:4px;border-radius:50%;background:#c9a84c;margin-top:2px;}
        .azan-alert{position:fixed;top:0;left:0;right:0;z-index:200;background:linear-gradient(135deg,#071a0e,#0d2e18);border-bottom:2px solid rgba(201,168,76,.3);padding:env(safe-area-inset-top,20px) 20px 16px;box-shadow:0 8px 32px rgba(0,0,0,.5);animation:azan-slide .4s cubic-bezier(.34,1.2,.64,1) both;display:flex;align-items:center;justify-content:space-between;gap:12px;}
        @keyframes azan-slide{from{transform:translateY(-100%);opacity:0}to{transform:translateY(0);opacity:1}}
        .stop-btn{background:rgba(201,168,76,.15);border:1px solid rgba(201,168,76,.3);border-radius:10px;padding:8px 14px;color:rgba(201,168,76,.9);font-family:'Plus Jakarta Sans',sans-serif;font-size:12px;font-weight:700;cursor:pointer;flex-shrink:0;}
        .azan-dot{width:8px;height:8px;border-radius:50%;background:#c9a84c;animation:pulse 1s ease-in-out infinite;flex-shrink:0;}
        .live-dot{width:7px;height:7px;border-radius:50%;background:rgba(201,168,76,.8);animation:pulse 1.8s ease-in-out infinite;flex-shrink:0;}
        .anim-1{animation:fadeDown .6s cubic-bezier(.22,1,.36,1) both;}
        .anim-2{animation:fadeUp .6s .1s cubic-bezier(.22,1,.36,1) both;}
        .anim-3{animation:fadeUp .6s .16s cubic-bezier(.22,1,.36,1) both;}
      `}</style>

      <div className="bg-base"/><div className="bg-pat"/>
      <div className="gold-bar bar-t"/><div className="gold-bar bar-b"/>

      {/* Azan alert */}
      {azanPlaying && (
        <div className="azan-alert">
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div className="azan-dot"/>
            <div>
              <p style={{fontSize:10,color:"rgba(201,168,76,.6)",fontWeight:700,textTransform:"uppercase",letterSpacing:"1px"}}>Allahu Akbar</p>
              <p style={{fontSize:15,fontWeight:800,color:"#fff"}}>Waktu {azanPrayer} telah tiba 🕌</p>
            </div>
          </div>
          <button className="stop-btn" onClick={stopAzan}>⏹ Stop</button>
        </div>
      )}

      <main className="hp-main" style={{paddingTop: azanPlaying ? 80 : 0}}>

        {/* HERO */}
        <div className="hero anim-1">
          <div className="hero-ring"/>
          <div style={{maxWidth:480,margin:"0 auto",position:"relative",zIndex:1}}>
            <p className="basmala">بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ</p>
            <div className="gold-line"/>
            <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:12}}>
              <div style={{display:"flex",alignItems:"center",gap:14,flex:1,minWidth:0}}>
                <div className="mosque-avatar">🕌</div>
                <div style={{minWidth:0}}>
                  <p style={{fontSize:10,fontWeight:700,letterSpacing:"1.5px",textTransform:"uppercase",color:"rgba(201,168,76,.6)",marginBottom:3}}>Assalamu'alaikum</p>
                  <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:17,fontWeight:700,color:"#e8d8a0",lineHeight:1.25,marginBottom:4}}>Jami' Nuril Anwar</h1>
                  <div style={{display:"flex",alignItems:"center",gap:4}}>
                    <MapPin size={11} color="rgba(201,168,76,.6)"/>
                    <span style={{fontSize:11,color:"rgba(255,255,255,.4)"}}>Karawang, Jawa Barat</span>
                  </div>
                  <div className="hijri-badge">⭐ 1447 H</div>
                </div>
              </div>
              <div style={{textAlign:"right",flexShrink:0}}>
                <div className="hero-clock">{time}</div>
                <p style={{fontSize:11,color:"rgba(255,255,255,.35)",marginTop:4}}>{today}</p>
              </div>
            </div>

            {/* Azan toggle */}
            <div className="azan-toggle" onClick={toggleAzan}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                {azanOn ? <Bell size={15} color="rgba(201,168,76,.8)"/> : <BellOff size={15} color="rgba(255,255,255,.3)"/>}
                <div>
                  <p style={{fontSize:13,fontWeight:700,color:azanOn?"#e8d8a0":"rgba(255,255,255,.4)"}}>Notifikasi Adzan</p>
                  <p style={{fontSize:10,color:"rgba(255,255,255,.25)",marginTop:1}}>
                    {azanOn ? "Adzan Makkah aktif di semua waktu sholat" : "Ketuk untuk aktifkan adzan otomatis"}
                  </p>
                </div>
              </div>
              <div className={`toggle-pill ${azanOn?"on":"off"}`}/>
            </div>
          </div>
        </div>

        <div className="content">

          {/* MENU */}
          <div className="anim-2">
            <div className="sec-head"><div className="sec-line sl"/><span className="sec-text">✦ Menu Utama ✦</span><div className="sec-line sr"/></div>
            <div className="feat-grid">
              {MENU.map(item => (
                <Link key={item.href} href={item.href}
                  className={`feat-card${pressed===item.href?" pressed":""}`}
                  style={{background:item.bg,borderColor:item.border}}
                  onMouseDown={()=>setPressed(item.href)} onMouseUp={()=>setPressed(null)}
                  onTouchStart={()=>setPressed(item.href)} onTouchEnd={()=>setPressed(null)}>
                  <div className="feat-emoji">{item.emoji}</div>
                  <p className="feat-label">{item.label}</p>
                  <p className="feat-sub">{item.sub}</p>
                  <div className="feat-action" style={{color:item.color}}>{item.action} <ChevronRight size={10}/></div>
                </Link>
              ))}
            </div>
          </div>

          {/* PRAYER */}
          <div className="anim-3">
            <div className="sec-head"><div className="sec-line sl"/><span className="sec-text">✦ Waktu Sholat ✦</span><div className="sec-line sr"/></div>
            <div className="prayer-card">
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <div>
                  <p style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"1.5px",color:"rgba(201,168,76,.6)",marginBottom:2}}>Sholat Berikutnya</p>
                  <p style={{fontFamily:"'Playfair Display',serif",fontSize:24,fontWeight:700,color:"#fff"}}>{nextPrayer}</p>
                </div>
                <div className="countdown-box">
                  <p style={{fontSize:9,fontWeight:700,color:"rgba(201,168,76,.5)",textTransform:"uppercase",letterSpacing:"1px",marginBottom:3}}>Countdown</p>
                  <p style={{fontSize:20,fontWeight:800,color:"#fff",fontVariantNumeric:"tabular-nums",letterSpacing:"1px"}}>{countdown}</p>
                </div>
              </div>
              <div className="prayer-highlight">
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <div className="live-dot"/>
                  <div>
                    <p style={{fontSize:10,color:"rgba(255,255,255,.4)",marginBottom:2}}>Segera</p>
                    <p style={{fontSize:17,fontWeight:800,color:"#fff"}}>{nextPrayer}</p>
                  </div>
                </div>
                <div style={{textAlign:"right"}}>
                  <p style={{fontFamily:"'Playfair Display',serif",fontSize:26,fontWeight:700,color:"rgba(201,168,76,.9)",fontVariantNumeric:"tabular-nums"}}>{nextPrayerTime}</p>
                  <p style={{fontSize:10,color:"rgba(255,255,255,.35)",marginTop:1}}>WIB</p>
                </div>
              </div>
              {PRAYERS.map(p => {
                const isActive = activePrayerKey === p.key;
                return (
                  <div key={p.key} className={`prayer-row${isActive?" active":""}`}>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      <span style={{fontSize:15,width:20,textAlign:"center"}}>{p.emoji}</span>
                      <span style={{fontSize:13,fontWeight:isActive?700:500,color:isActive?"rgba(201,168,76,.9)":"rgba(255,255,255,.5)"}}>{p.name}</span>
                    </div>
                    <span style={{fontSize:13,fontWeight:700,color:isActive?"#c9a84c":"rgba(255,255,255,.35)",fontVariantNumeric:"tabular-nums"}}>
                      {prayerTimes ? prayerTimes[p.key] : "--:--"}
                    </span>
                  </div>
                );
              })}
              <Link href="/kiblat" style={{textDecoration:"none"}}>
                <button className="kiblat-btn">🧭 Cek Arah Kiblat</button>
              </Link>
            </div>
          </div>

          {/* DONASI */}
          <div className="sec-head"><div className="sec-line sl"/><span className="sec-text">✦ Donasi Masjid ✦</span><div className="sec-line sr"/></div>
          <Link href="/donasi" className="donasi-card">
            <div style={{display:"flex",alignItems:"center",gap:14,position:"relative",zIndex:1}}>
              <div className="donasi-icon">💝</div>
              <div>
                <p style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"1px",color:"rgba(255,255,255,.4)",marginBottom:3}}>Amal Jariyah</p>
                <p style={{fontSize:15,fontWeight:700,color:"#fff"}}>Infaq Shodaqoh</p>
                <p style={{fontSize:11,color:"rgba(255,255,255,.4)",marginTop:2}}>QRIS & Transfer Bank tersedia</p>
              </div>
            </div>
            <div className="donasi-btn" style={{position:"relative",zIndex:1}}>
              <Heart size={11} fill="currentColor"/> Donasi
            </div>
          </Link>

          {/* QUOTE */}
          <div className="sec-head"><div className="sec-line sl"/><span className="sec-text">✦ Inspirasi ✦</span><div className="sec-line sr"/></div>
          <div className="quote-card">
            <p style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"1.5px",color:"rgba(255,255,255,.4)",marginBottom:10}}>✦ Quote</p>
            <p style={{fontFamily:"'Amiri',serif",fontSize:18,lineHeight:1.65,color:"#fff",position:"relative",zIndex:1}}>
              "Apa yang kau cari sedang mencarimu."
            </p>
            <div style={{height:1,background:"linear-gradient(90deg,transparent,rgba(255,255,255,.15),transparent)",margin:"12px 0 8px"}}/>
            <p style={{fontSize:12,color:"rgba(255,255,255,.4)",fontStyle:"italic"}}>— Jalaluddin Rumi</p>
          </div>

          {/* KAJIAN */}
          <div className="sec-head"><div className="sec-line sl"/><span className="sec-text">✦ Kajian Rutin ✦</span><div className="sec-line sr"/></div>
          <div className="kajian-card">
            <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",position:"relative",zIndex:1}}>
              <div>
                <div style={{display:"inline-flex",alignItems:"center",gap:5,background:"rgba(155,89,182,.18)",border:"1px solid rgba(155,89,182,.3)",borderRadius:20,padding:"3px 10px",marginBottom:10}}>
                  <span style={{width:5,height:5,borderRadius:"50%",background:"#9b59b6"}}/>
                  <span style={{fontSize:10,fontWeight:700,letterSpacing:".8px",textTransform:"uppercase",color:"rgba(155,89,182,.9)"}}>Rutin</span>
                </div>
                <h4 style={{fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:700,color:"#fff",marginBottom:6}}>Kajian Rutin</h4>
                <p style={{fontSize:12,color:"rgba(255,255,255,.45)",marginBottom:3}}>Ba'da Isya · Setiap Malam Senin</p>
              </div>
              <span style={{fontSize:36}}>🎓</span>
            </div>
          </div>
                    
          {/* AI */}
          <div className="sec-head"><div className="sec-line sl"/><span className="sec-text">✦ AI Islam ✦</span><div className="sec-line sr"/></div>
          <Link href="/ai" className="ai-card">
            <div style={{display:"flex",alignItems:"center",gap:14}}>
              <div className="ai-icon"><Bot size={20} color="rgba(201,168,76,0.8)"/></div>
              <div>
                <p style={{fontSize:14,fontWeight:700,color:"#e8d8a0"}}>AI Islam</p>
                <p style={{fontSize:12,color:"rgba(255,255,255,.35)",marginTop:1}}>Tanya apa saja tentang Islam</p>
              </div>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:4,color:"rgba(201,168,76,.7)"}}>
              <span style={{fontSize:12,fontWeight:600}}>Mulai</span>
              <ChevronRight size={14}/>
            </div>
          </Link>

          <div style={{height:16}}/>
        </div>

        {/* BOTTOM NAV */}
        <div className="bottom-nav">
          <div className="bottom-nav-inner">
            {[
              { href:"/",       Icon:Home,     label:"Home",    active:true  },
              { href:"/quran",  Icon:BookOpen, label:"Quran",   active:false },
              { href:"/hadist", Icon:Bell,     label:"Hadist",  active:false },
              { href:"/donasi", Icon:Heart,    label:"Donasi",  active:false },
              { href:"/ai",     Icon:Bot,      label:"AI Islam",active:false },
            ].map(({href,Icon,label,active}) => (
              <Link key={href} href={href} className={`nav-tab${active?" active":""}`}>
                <Icon size={20}/>
                <span>{label}</span>
                {active && <div className="nav-dot"/>}
              </Link>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}