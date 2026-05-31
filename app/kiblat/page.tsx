"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Navigation, MapPin, RefreshCw } from "lucide-react";

// Koordinat Ka'bah
const KAABA_LAT = 21.4225;
const KAABA_LNG = 39.8262;

function getQiblaAngle(lat: number, lng: number): number {
  const φ1 = (lat * Math.PI) / 180;
  const φ2 = (KAABA_LAT * Math.PI) / 180;
  const Δλ = ((KAABA_LNG - lng) * Math.PI) / 180;
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  const θ = Math.atan2(y, x);
  return ((θ * 180) / Math.PI + 360) % 360;
}

function getDistance(lat: number, lng: number): string {
  const R = 6371;
  const dLat = ((KAABA_LAT - lat) * Math.PI) / 180;
  const dLng = ((KAABA_LNG - lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat * Math.PI) / 180) *
      Math.cos((KAABA_LAT * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const km = R * c;
  return km > 1000 ? `${(km / 1000).toFixed(1)} ribu km` : `${Math.round(km)} km`;
}

type Status = "idle" | "loading" | "granted" | "denied" | "unsupported";

export default function KiblatPage() {
  const [status, setStatus]         = useState<Status>("idle");
  const [qiblaAngle, setQiblaAngle] = useState(0);
  const [compassHeading, setCompassHeading] = useState(0);
  const [distance, setDistance]     = useState("");
  const [userLat, setUserLat]       = useState(0);
  const [userLng, setUserLng]       = useState(0);
  const [accuracy, setAccuracy]     = useState<number | null>(null);
  const [needleAnim, setNeedleAnim] = useState(false);
  const watchId = useRef<number | null>(null);

  const requestLocation = () => {
    if (!navigator.geolocation) { setStatus("unsupported"); return; }
    setStatus("loading");
    watchId.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, accuracy: acc } = pos.coords;
        setUserLat(latitude);
        setUserLng(longitude);
        setAccuracy(Math.round(acc));
        setQiblaAngle(getQiblaAngle(latitude, longitude));
        setDistance(getDistance(latitude, longitude));
        setStatus("granted");
        setNeedleAnim(true);
        setTimeout(() => setNeedleAnim(false), 600);
      },
      () => setStatus("denied"),
      { enableHighAccuracy: true, maximumAge: 5000 }
    );
  };

  // Device orientation for compass
  useEffect(() => {
    const handler = (e: DeviceOrientationEvent) => {
      const heading = (e as any).webkitCompassHeading ?? (e.alpha ? 360 - e.alpha : 0);
      setCompassHeading(heading);
    };
    window.addEventListener("deviceorientation", handler, true);
    return () => {
      window.removeEventListener("deviceorientation", handler, true);
      if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current);
    };
  }, []);

  // needle rotation: qibla direction minus device heading
  const needleRotation = qiblaAngle - compassHeading;
  const isAligned = Math.abs(((needleRotation % 360) + 360) % 360 - 360) < 15 ||
                    Math.abs(((needleRotation % 360) + 360) % 360) < 15;

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700&family=Nunito:wght@400;500;600;700;800&family=Amiri:wght@400;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --g:    #166534;
          --g2:   #15803d;
          --gold: #d4a732;
          --gold2:#f0c84e;
          --ink:  #0f1f0f;
          --bg:   #f0faf4;
        }
        html { -webkit-tap-highlight-color: transparent; }
        body { background: var(--bg); font-family: 'Nunito', sans-serif; color: var(--ink); }

        /* ── HEADER ── */
        .kib-header {
          background: linear-gradient(160deg,#0c3d20,#166534 50%,#14532d);
          padding: 52px 20px 24px;
          border-radius: 0 0 32px 32px;
          box-shadow: 0 10px 32px rgba(22,101,52,.3);
          position: relative; overflow: hidden;
        }
        .kib-header::before {
          content:'';
          position:absolute; inset:0;
          background: radial-gradient(ellipse 60% 60% at 80% 20%, rgba(212,167,50,.1) 0%, transparent 70%);
          pointer-events:none;
        }
        .back-btn {
          display:inline-flex; align-items:center; gap:6px;
          color:rgba(255,255,255,.7); text-decoration:none;
          font-size:13px; font-weight:700;
          margin-bottom:18px;
          transition: color .15s;
        }
        .back-btn:active { color:#fff; }

        /* ── COMPASS WRAPPER ── */
        .compass-wrap {
          position:relative;
          width:280px; height:280px;
          margin:32px auto;
          filter: drop-shadow(0 16px 40px rgba(22,101,52,.25));
        }

        /* outer ring */
        .compass-ring-outer {
          position:absolute; inset:0;
          border-radius:50%;
          background: conic-gradient(
            from 0deg,
            rgba(212,167,50,.08) 0deg 90deg,
            rgba(212,167,50,.04) 90deg 180deg,
            rgba(212,167,50,.08) 180deg 270deg,
            rgba(212,167,50,.04) 270deg 360deg
          );
          border:2px solid rgba(212,167,50,.25);
        }

        /* compass face */
        .compass-face {
          position:absolute;
          inset:14px;
          border-radius:50%;
          background: radial-gradient(circle at 40% 35%, #1e5c3a 0%, #0d3320 60%, #07200e 100%);
          border:1px solid rgba(212,167,50,.2);
          overflow:hidden;
        }
        .compass-face::before {
          content:'';
          position:absolute; inset:0;
          background: repeating-conic-gradient(rgba(212,167,50,.04) 0deg 5deg, transparent 5deg 15deg);
        }

        /* cardinal labels */
        .cardinal {
          position:absolute;
          font-family:'Cinzel',serif;
          font-size:13px; font-weight:700;
          color:rgba(212,167,50,.8);
        }
        .cardinal.N { top:18px; left:50%; transform:translateX(-50%); color:var(--gold2); }
        .cardinal.S { bottom:18px; left:50%; transform:translateX(-50%); }
        .cardinal.E { right:18px; top:50%; transform:translateY(-50%); }
        .cardinal.W { left:18px; top:50%; transform:translateY(-50%); }

        /* tick marks */
        .tick-ring {
          position:absolute; inset:20px;
          border-radius:50%;
        }

        /* needle */
        .needle-wrap {
          position:absolute; inset:0;
          display:flex; align-items:center; justify-content:center;
          transition: transform .4s cubic-bezier(.25,.46,.45,.94);
        }
        .needle {
          width:8px; height:120px;
          position:relative;
          display:flex; flex-direction:column; align-items:center;
        }
        .needle-top {
          width:0; height:0;
          border-left:5px solid transparent;
          border-right:5px solid transparent;
          border-bottom:70px solid var(--gold2);
          filter: drop-shadow(0 0 8px rgba(240,200,78,.6));
        }
        .needle-bottom {
          width:0; height:0;
          border-left:5px solid transparent;
          border-right:5px solid transparent;
          border-top:50px solid rgba(255,255,255,.15);
        }
        .needle-center {
          position:absolute;
          top:50%; left:50%;
          transform:translate(-50%,-50%);
          width:16px; height:16px;
          border-radius:50%;
          background: radial-gradient(circle, var(--gold2) 0%, var(--gold) 60%);
          border:2px solid rgba(255,255,255,.3);
          box-shadow:0 0 12px rgba(212,167,50,.5);
          z-index:10;
        }

        /* kaaba icon at needle tip */
        .kaaba-icon {
          position:absolute;
          top:-38px; left:50%;
          transform:translateX(-50%);
          font-size:22px;
          filter:drop-shadow(0 2px 6px rgba(0,0,0,.4));
        }

        /* aligned glow */
        .compass-face.aligned {
          box-shadow: inset 0 0 40px rgba(212,167,50,.15), 0 0 30px rgba(212,167,50,.2);
          border-color:rgba(212,167,50,.5);
        }

        /* ── INFO CARD ── */
        .info-card {
          background:#fff;
          border-radius:22px;
          padding:20px;
          border:1px solid rgba(22,101,52,.1);
          box-shadow:0 4px 20px rgba(0,0,0,.06);
          margin-bottom:14px;
        }

        .info-row {
          display:flex; align-items:center; justify-content:space-between;
          padding:10px 0;
          border-bottom:1px solid rgba(0,0,0,.05);
        }
        .info-row:last-child { border-bottom:none; padding-bottom:0; }

        /* ── STATUS STATES ── */
        .state-box {
          background: linear-gradient(145deg,#0c3d20,#166534);
          border-radius:24px;
          padding:40px 24px;
          text-align:center;
          border:1px solid rgba(212,167,50,.2);
          margin:32px 0;
        }

        .locate-btn {
          display:inline-flex; align-items:center; gap:8px;
          background:linear-gradient(90deg,var(--gold),var(--gold2));
          color:#3a1f00;
          font-family:'Nunito',sans-serif;
          font-size:14px; font-weight:800;
          border:none; border-radius:16px;
          padding:14px 28px;
          cursor:pointer;
          margin-top:20px;
          transition:transform .12s, opacity .12s;
        }
        .locate-btn:active { transform:scale(.96); opacity:.88; }

        @keyframes spin { to { transform:rotate(360deg); } }
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(14px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes pulseGold {
          0%,100% { box-shadow:0 0 0 0 rgba(212,167,50,.4); }
          50%      { box-shadow:0 0 0 14px rgba(212,167,50,0); }
        }

        .spin { animation:spin 1.2s linear infinite; }
        .anim-1 { animation:fadeUp .35s ease both; }
        .anim-2 { animation:fadeUp .35s .08s ease both; }
        .anim-3 { animation:fadeUp .35s .16s ease both; }

        .pulse-ring {
          animation:pulseGold 2s ease-in-out infinite;
          border-radius:50%;
        }

        .aligned-badge {
          display:inline-flex; align-items:center; gap:6px;
          background:rgba(22,101,52,.1);
          border:1px solid rgba(22,101,52,.25);
          border-radius:20px;
          padding:6px 14px;
          font-size:12px; font-weight:800;
          color:var(--g2);
        }
        .aligned-badge.yes {
          background:rgba(212,167,50,.12);
          border-color:rgba(212,167,50,.35);
          color:#7a4f00;
        }

        .degree-display {
          font-family:'Cinzel',serif;
          font-size:48px; font-weight:700;
          color:var(--g);
          line-height:1;
        }
      `}</style>

      <main style={{ minHeight: "100vh", paddingBottom: 40 }}>

        {/* HEADER */}
        <div className="kib-header anim-1">
          <div style={{ maxWidth: 480, margin: "0 auto", position: "relative", zIndex: 1 }}>
            <Link href="/" className="back-btn">
              <ArrowLeft size={16} /> Kembali
            </Link>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{
                width: 50, height: 50, borderRadius: 16,
                background: "rgba(212,167,50,.15)",
                border: "1px solid rgba(212,167,50,.3)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 24, flexShrink: 0
              }}>🕋</div>
              <div>
                <h1 style={{ fontFamily: "'Cinzel',serif", fontSize: 20, fontWeight: 700, color: "#fff" }}>
                  Arah Kiblat
                </h1>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,.5)", marginTop: 3 }}>
                  Kompas menuju Ka'bah — Makkah Al-Mukarramah
                </p>
              </div>
            </div>
          </div>
        </div>

        <div style={{ maxWidth: 480, margin: "0 auto", padding: "0 16px" }}>

          {/* IDLE / LOADING / DENIED */}
          {status !== "granted" && (
            <div className="state-box anim-2">
              {status === "idle" && (
                <>
                  <div style={{ fontSize: 60, marginBottom: 16 }}>🕋</div>
                  <p style={{ fontFamily: "'Amiri',serif", fontSize: 22, color: "rgba(212,167,50,.9)", marginBottom: 8 }}>
                    اتجاه القبلة
                  </p>
                  <p style={{ fontSize: 14, color: "rgba(255,255,255,.55)", lineHeight: 1.6 }}>
                    Aktifkan lokasi untuk menemukan<br />arah kiblat yang presisi
                  </p>
                  <button className="locate-btn" onClick={requestLocation}>
                    <Navigation size={16} /> Aktifkan Lokasi
                  </button>
                </>
              )}
              {status === "loading" && (
                <>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>
                    <RefreshCw size={48} color="rgba(212,167,50,.7)" className="spin" />
                  </div>
                  <p style={{ fontSize: 14, color: "rgba(255,255,255,.6)" }}>Mendeteksi lokasi Anda...</p>
                </>
              )}
              {status === "denied" && (
                <>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
                  <p style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 8 }}>Izin Lokasi Ditolak</p>
                  <p style={{ fontSize: 13, color: "rgba(255,255,255,.5)", marginBottom: 20, lineHeight: 1.6 }}>
                    Aktifkan izin lokasi di pengaturan browser Anda, lalu coba lagi.
                  </p>
                  <button className="locate-btn" onClick={requestLocation}>
                    <RefreshCw size={15} /> Coba Lagi
                  </button>
                </>
              )}
              {status === "unsupported" && (
                <>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>📵</div>
                  <p style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>GPS Tidak Tersedia</p>
                  <p style={{ fontSize: 13, color: "rgba(255,255,255,.5)", marginTop: 8 }}>
                    Perangkat Anda tidak mendukung geolokasi.
                  </p>
                </>
              )}
            </div>
          )}

          {/* COMPASS */}
          {status === "granted" && (
            <>
              {/* degree + aligned badge */}
              <div className="anim-2" style={{ textAlign: "center", marginTop: 28 }}>
                <div className="degree-display">
                  {Math.round(((qiblaAngle - compassHeading) % 360 + 360) % 360)}°
                </div>
                <p style={{ fontSize: 12, color: "#6b7280", marginTop: 4, marginBottom: 12 }}>dari arah Utara</p>
                <div className={`aligned-badge${isAligned ? " yes" : ""}`}>
                  {isAligned ? "✅ Menghadap Kiblat!" : "🧭 Putar ke arah jarum"}
                </div>
              </div>

              {/* Compass */}
              <div className="anim-2">
                <div className="compass-wrap">
                  {/* outer ring */}
                  <div className="compass-ring-outer pulse-ring" />

                  {/* compass face */}
                  <div className={`compass-face${isAligned ? " aligned" : ""}`}>
                    <span className="cardinal N">U</span>
                    <span className="cardinal S">S</span>
                    <span className="cardinal E">T</span>
                    <span className="cardinal W">B</span>

                    {/* needle */}
                    <div
                      className="needle-wrap"
                      style={{ transform: `rotate(${needleRotation}deg)` }}
                    >
                      <div className="needle">
                        <div style={{ position: "relative" }}>
                          <span className="kaaba-icon">🕋</span>
                          <div className="needle-top" />
                        </div>
                        <div className="needle-bottom" />
                      </div>
                      <div className="needle-center" />
                    </div>
                  </div>
                </div>
              </div>

              {/* INFO CARDS */}
              <div className="info-card anim-3">
                <p style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "1.5px", color: "var(--g2)", marginBottom: 12 }}>
                  ✦ Informasi Lokasi
                </p>
                <div className="info-row">
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <MapPin size={15} color="var(--g2)" />
                    <span style={{ fontSize: 13, color: "#6b7280" }}>Koordinat Anda</span>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "var(--ink)", fontVariantNumeric: "tabular-nums" }}>
                    {userLat.toFixed(4)}°, {userLng.toFixed(4)}°
                  </span>
                </div>
                <div className="info-row">
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 15 }}>🕋</span>
                    <span style={{ fontSize: 13, color: "#6b7280" }}>Jarak ke Ka'bah</span>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 800, color: "var(--g)" }}>{distance}</span>
                </div>
                <div className="info-row">
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Navigation size={15} color="var(--g2)" />
                    <span style={{ fontSize: 13, color: "#6b7280" }}>Akurasi GPS</span>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: accuracy && accuracy < 30 ? "var(--g)" : "#f59e0b" }}>
                    ±{accuracy}m {accuracy && accuracy < 30 ? "✓" : "⚠️"}
                  </span>
                </div>
                <div className="info-row">
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 15 }}>🧭</span>
                    <span style={{ fontSize: 13, color: "#6b7280" }}>Arah Kiblat</span>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 800, color: "var(--ink)" }}>
                    {Math.round(qiblaAngle)}° dari Utara
                  </span>
                </div>
              </div>

              {/* tip */}
              <div style={{
                background: "rgba(22,101,52,.06)",
                border: "1px solid rgba(22,101,52,.12)",
                borderRadius: 16, padding: "12px 16px",
                display: "flex", gap: 10, alignItems: "flex-start",
                marginBottom: 24
              }} className="anim-3">
                <span style={{ fontSize: 18, flexShrink: 0 }}>💡</span>
                <p style={{ fontSize: 12, color: "#4b5563", lineHeight: 1.6 }}>
                  Putar badan Anda sampai ikon 🕋 di ujung jarum mengarah tepat ke atas. Pastikan berada di area terbuka untuk akurasi terbaik.
                </p>
              </div>
            </>
          )}
        </div>
      </main>
    </>
  );
}