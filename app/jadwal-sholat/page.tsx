"use client";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Bell, BellOff, Clock } from "lucide-react";

type PrayerTimes = {
  Fajr: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
  hijriDate: string;
  gregorianDate: string;
  city: string;
  province: string;
};

const PRAYER_NAMES: Record<string, string> = {
  Fajr: "Subuh",
  Dhuhr: "Dzuhur",
  Asr: "Ashar",
  Maghrib: "Maghrib",
  Isha: "Isya",
};

const PRAYER_ICONS: Record<string, string> = {
  Fajr: "🌙",
  Dhuhr: "☀️",
  Asr: "🌤️",
  Maghrib: "🌇",
  Isha: "🌙",
};

export default function JadwalSholatPage() {
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);
  const [currentTime, setCurrentTime] = useState("");
  const [nextPrayer, setNextPrayer] = useState<{ name: string; time: string } | null>(null);
  const [subscribed, setSubscribed] = useState(false);
  const [subLoading, setSubLoading] = useState(false);
  const [subMsg, setSubMsg] = useState("");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const notifiedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    fetch("/api/prayer")
      .then(r => r.json())
      .then(data => setPrayerTimes(data))
      .catch(console.error);
  }, []);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const hh = now.getHours().toString().padStart(2, "0");
      const mm = now.getMinutes().toString().padStart(2, "0");
      const ss = now.getSeconds().toString().padStart(2, "0");
      setCurrentTime(`${hh}:${mm}:${ss}`);

      if (!prayerTimes) return;

      const prayers = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"] as const;
      const nowMinutes = now.getHours() * 60 + now.getMinutes();
      const nowStr = `${hh}:${mm}`;

      prayers.forEach(p => {
        const pTime = prayerTimes[p];
        if (pTime === nowStr && now.getSeconds() === 0 && !notifiedRef.current.has(`${p}-${nowStr}`)) {
          notifiedRef.current.add(`${p}-${nowStr}`);
          playAzan();
          sendPushToAll(PRAYER_NAMES[p], pTime);
        }
      });

      let found = false;
      for (const p of prayers) {
        const [ph, pm] = prayerTimes[p].split(":").map(Number);
        const pMinutes = ph * 60 + pm;
        if (pMinutes > nowMinutes) {
          setNextPrayer({ name: PRAYER_NAMES[p], time: prayerTimes[p] });
          found = true;
          break;
        }
      }
      if (!found) setNextPrayer({ name: "Subuh", time: prayerTimes.Fajr });
    };

    const interval = setInterval(tick, 1000);
    tick();
    return () => clearInterval(interval);
  }, [prayerTimes]);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistration("/sw.js").then(async reg => {
        if (reg) {
          const sub = await reg.pushManager.getSubscription();
          if (sub) setSubscribed(true);
        }
      });
    }
  }, []);

  function playAzan() {
    try {
      if (!audioRef.current) audioRef.current = new Audio("/a9.mp3");
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(console.error);
    } catch (e) {
      console.error(e);
    }
  }

  async function sendPushToAll(prayerName: string, time: string) {
    try {
      await fetch("/api/push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "send",
          title: `Waktu ${prayerName}`,
          body: `Telah masuk waktu ${prayerName} pukul ${time} - Masjid Jami Nuril Anwar`,
        }),
      });
    } catch (e) {
      console.error(e);
    }
  }

  async function handleSubscribe() {
    setSubLoading(true);
    setSubMsg("");
    try {
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        setSubMsg("Browser tidak mendukung push notifikasi.");
        return;
      }

      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setSubMsg("Izin notifikasi ditolak.");
        return;
      }

      const reg = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;

      const existing = await reg.pushManager.getSubscription();
      if (existing) {
        setSubscribed(true);
        setSubMsg("Sudah terdaftar notifikasi azan");
        return;
      }

      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidKey) {
        setSubMsg("VAPID key tidak ditemukan. Cek .env.local");
        return;
      }

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidKey,
      });

      await fetch("/api/push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "subscribe", subscription: sub }),
      });

      setSubscribed(true);
      setSubMsg("Berhasil! Kamu akan dapat notifikasi azan");
    } catch (err) {
      console.error(err);
      setSubMsg("Gagal mendaftar notifikasi. " + (err instanceof Error ? err.message : ""));
    } finally {
      setSubLoading(false);
    }
  }

  async function handleUnsubscribe() {
    try {
      const reg = await navigator.serviceWorker.getRegistration("/sw.js");
      if (reg) {
        const sub = await reg.pushManager.getSubscription();
        if (sub) await sub.unsubscribe();
      }
      setSubscribed(false);
      setSubMsg("Notifikasi dinonaktifkan.");
    } catch (err) {
      console.error(err);
    }
  }

  const today = new Date().toLocaleDateString("id-ID", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  const prayers = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"] as const;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        body{background:var(--msj-bg);font-family:'Plus Jakarta Sans',sans-serif;color:var(--msj-text-body);}
        .bg-base{position:fixed;inset:0;background:var(--msj-bg-gradient);z-index:0;}
        .bg-pat{position:fixed;inset:0;opacity:var(--msj-pattern-opacity);z-index:0;
          background-image:url("data:image/svg+xml,%3Csvg width='120' height='120' viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23c9a84c' stroke-width='0.6'%3E%3Cpolygon points='60,6 114,33 114,87 60,114 6,87 6,33'/%3E%3Cpolygon points='60,22 98,42 98,78 60,98 22,78 22,42'/%3E%3C/g%3E%3C/svg%3E");
          background-size:120px 120px;}
        .bar{position:fixed;left:0;right:0;height:2px;z-index:10;background:var(--msj-bar);}
        .bar-t{top:0;}.bar-b{bottom:0;}
        .page{position:relative;z-index:1;min-height:100vh;padding-bottom:48px;}
        .wrap{max-width:480px;margin:0 auto;padding:0 20px;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        .header{background:var(--msj-hadist-header-bg);border-radius:0 0 28px 28px;padding:56px 20px 24px;position:relative;overflow:hidden;border-bottom:1px solid var(--msj-gold-border);box-shadow:var(--msj-card-shadow);}
        .header::before{content:'';position:absolute;inset:0;pointer-events:none;background:radial-gradient(ellipse 60% 60% at 80% 20%,var(--msj-gold-bg) 0%,transparent 70%);}
        .back-btn{display:inline-flex;align-items:center;gap:6px;color:var(--msj-gold-text);text-decoration:none;font-size:13px;font-weight:600;margin-bottom:16px;}
        .page-title{font-size:22px;font-weight:700;color:var(--msj-text-title);}
        .page-sub{font-size:11px;color:var(--msj-text-sub);margin-top:3px;}
        .clock-card{background:var(--msj-card-bg);border:1px solid var(--msj-gold-border);border-radius:20px;padding:20px;margin-top:16px;text-align:center;animation:fadeUp .4s ease both;}
        .clock{font-size:36px;font-weight:700;color:var(--msj-text-title);letter-spacing:2px;font-variant-numeric:tabular-nums;}
        .clock-date{font-size:11px;color:var(--msj-text-sub);margin-top:4px;}
        .next-prayer{display:inline-flex;align-items:center;gap:6px;margin-top:10px;padding:6px 16px;border-radius:20px;background:var(--msj-gold-bg);border:1px solid var(--msj-gold-border);font-size:12px;font-weight:600;color:var(--msj-gold-text);}
        .notif-card{background:var(--msj-card-bg);border:1px solid var(--msj-card-border);border-radius:16px;padding:14px 16px;margin-top:12px;display:flex;align-items:center;gap:12px;animation:fadeUp .4s ease .1s both;}
        .notif-info{flex:1;}
        .notif-title{font-size:13px;font-weight:600;color:var(--msj-text-title);}
        .notif-desc{font-size:11px;color:var(--msj-text-muted);margin-top:2px;}
        .notif-msg{font-size:11px;margin-top:4px;color:#2ecc71;}
        .sub-btn{display:flex;align-items:center;gap:6px;padding:8px 14px;border-radius:10px;border:1px solid;font-family:'Plus Jakarta Sans',sans-serif;font-size:12px;font-weight:600;cursor:pointer;transition:all .2s;white-space:nowrap;flex-shrink:0;}
        .sub-btn.on{background:rgba(46,204,113,.1);border-color:rgba(46,204,113,.4);color:#2ecc71;}
        .sub-btn.off{background:var(--msj-gold-bg);border-color:var(--msj-gold-border);color:var(--msj-gold-text);}
        .sub-btn:disabled{opacity:.5;cursor:not-allowed;}
        .sec-head{display:flex;align-items:center;gap:10px;margin:20px 0 12px;}
        .sec-line{flex:1;height:1px;background:var(--msj-divider-line-l);}
        .sec-text{font-size:9px;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;color:var(--msj-divider-text);white-space:nowrap;}
        .prayer-list{display:flex;flex-direction:column;gap:10px;}
        .prayer-card{background:var(--msj-card-bg);border:1px solid var(--msj-card-border);border-radius:16px;padding:14px 18px;display:flex;align-items:center;justify-content:space-between;animation:fadeUp .4s ease both;}
        .prayer-card.next{border-color:var(--msj-gold-border);background:var(--msj-gold-bg);}
        .prayer-left{display:flex;align-items:center;gap:10px;}
        .prayer-icon{font-size:20px;}
        .prayer-name{font-size:14px;font-weight:600;color:var(--msj-text-title);}
        .prayer-label{font-size:10px;color:#c9a84c;margin-top:1px;}
        .prayer-time{font-size:18px;font-weight:700;color:var(--msj-text-title);font-variant-numeric:tabular-nums;}
        :root{--msj-hadist-header-bg:linear-gradient(160deg,#1a0e00 0%,#4a2e00 40%,#2d1a00 100%);}
        html:not(.dark){--msj-hadist-header-bg:linear-gradient(160deg,#f5e9d0 0%,#e8d5a8 40%,#eedfc0 100%);}
      `}</style>

      <div className="bg-base"/><div className="bg-pat"/>
      <div className="bar bar-t"/><div className="bar bar-b"/>

      <div className="page">
        <div className="header">
          <div className="wrap" style={{position:"relative",zIndex:1}}>
            <Link href="/home" className="back-btn"><ArrowLeft size={15}/> Kembali</Link>
            <div className="page-title">Jadwal Sholat</div>
            <div className="page-sub">Masjid Jami Nuril Anwar - {prayerTimes?.city}, {prayerTimes?.province}</div>
          </div>
        </div>

        <div className="wrap">
          <div className="clock-card">
            <div className="clock" suppressHydrationWarning>{currentTime || "--:--:--"}</div>
            <div className="clock-date" suppressHydrationWarning>{today}</div>
            {prayerTimes && <div className="clock-date" style={{marginTop:4}}>{prayerTimes.hijriDate}</div>}
            {nextPrayer && (
              <div className="next-prayer">
                <Clock size={12}/> Selanjutnya: {nextPrayer.name} - {nextPrayer.time}
              </div>
            )}
          </div>

          <div className="notif-card">
            <div style={{fontSize:24}}>{subscribed ? "🔔" : "🔕"}</div>
            <div className="notif-info">
              <div className="notif-title">Notifikasi Azan</div>
              <div className="notif-desc">Dapat notif saat waktu sholat tiba</div>
              {subMsg && <div className="notif-msg">{subMsg}</div>}
            </div>
            {subscribed ? (
              <button className="sub-btn on" onClick={handleUnsubscribe}>
                <BellOff size={12}/> Nonaktifkan
              </button>
            ) : (
              <button className="sub-btn off" onClick={handleSubscribe} disabled={subLoading}>
                <Bell size={12}/> {subLoading ? "..." : "Aktifkan"}
              </button>
            )}
          </div>

          <div className="sec-head">
            <div className="sec-line"/>
            <span className="sec-text">Waktu Sholat Hari Ini</span>
            <div className="sec-line"/>
          </div>

          <div className="prayer-list">
            {prayers.map((p, i) => {
              const isNext = nextPrayer?.name === PRAYER_NAMES[p];
              return (
                <div key={p} className={`prayer-card ${isNext?"next":""}`} style={{animationDelay:`${i*0.06}s`}}>
                  <div className="prayer-left">
                    <div className="prayer-icon">{PRAYER_ICONS[p]}</div>
                    <div>
                      <div className="prayer-name">{PRAYER_NAMES[p]}</div>
                      {isNext && <div className="prayer-label">Waktu selanjutnya</div>}
                    </div>
                  </div>
                  <div className="prayer-time">{prayerTimes?.[p] || "--:--"}</div>
                </div>
              );
            })}
          </div>

          <div style={{height:32}}/>
        </div>
      </div>
    </>
  );
}