"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";

const CORRECT_PIN = "200300";

export default function AdminLoginPage() {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [status, setStatus] = useState<"idle" | "error" | "success">("idle");
  const [shake, setShake] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("admin-auth")) router.replace("/admin");
  }, [router]);

  const handleSubmit = useCallback((currentPin: string) => {
    if (currentPin.length < 6) return;
    if (currentPin === CORRECT_PIN) {
      setStatus("success");
      localStorage.setItem("admin-auth", "true");
      setTimeout(() => router.push("/admin"), 900);
    } else {
      setStatus("error");
      setShake(true);
      setTimeout(() => { setPin(""); setStatus("idle"); setShake(false); }, 900);
    }
  }, [router]);

  const pressNum = useCallback((n: string) => {
    if (status === "error" || status === "success") return;
    setPin((prev) => {
      if (prev.length >= 6) return prev;
      const next = prev + n;
      if (next.length === 6) setTimeout(() => handleSubmit(next), 150);
      return next;
    });
  }, [status, handleSubmit]);

  const deleteLast = useCallback(() => {
    if (status !== "idle") return;
    setPin((prev) => prev.slice(0, -1));
  }, [status]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key >= "0" && e.key <= "9") pressNum(e.key);
      else if (e.key === "Backspace") deleteLast();
      else if (e.key === "Enter") handleSubmit(pin);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [pressNum, deleteLast, handleSubmit, pin]);

  const hintText = () => {
    if (status === "error") return "PIN salah, coba lagi";
    if (status === "success") return "✓ PIN benar, mengalihkan...";
    if (pin.length === 0) return "Masukkan PIN 6 digit";
    if (pin.length < 6) return `${pin.length} / 6 digit`;
    return "Tekan Masuk untuk melanjutkan";
  };

  const dotStyle = (i: number): React.CSSProperties => {
    if (status === "success") return { background: "#7ecf9a", borderColor: "#7ecf9a", boxShadow: "0 0 10px rgba(126,207,154,0.5)", transform: "scale(1.15)" };
    if (status === "error" && i < pin.length) return { background: "#e05a5a", borderColor: "#e05a5a", boxShadow: "0 0 10px rgba(224,90,90,0.4)", transform: "scale(1.15)" };
    if (i < pin.length) return { background: "var(--msj-gold-bright)", borderColor: "var(--msj-gold-bright)", boxShadow: "0 0 10px rgba(201,168,76,0.5)", transform: "scale(1.15)" };
    return { background: "transparent", borderColor: "var(--msj-gold-border)" };
  };

  const numpad = [["1",""],["2","ABC"],["3","DEF"],["4","GHI"],["5","JKL"],["6","MNO"],["7","PQRS"],["8","TUV"],["9","WXYZ"]];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Playfair+Display:wght@500;700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .al-root {
          min-height: 100vh;
          background: var(--msj-bg);
          display: flex; align-items: center; justify-content: center;
          font-family: 'Plus Jakarta Sans', sans-serif;
          position: relative; overflow: hidden; padding: 24px;
          transition: background var(--msj-transition);
        }
        .bg-base {
          position: fixed; inset: 0;
          background: var(--msj-bg-gradient);
          transition: background var(--msj-transition);
        }
        .bg-pat {
          position: fixed; inset: 0;
          opacity: var(--msj-pattern-opacity);
          background-image: url("data:image/svg+xml,%3Csvg width='120' height='120' viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23c9a84c' stroke-width='0.6'%3E%3Cpolygon points='60,6 114,33 114,87 60,114 6,87 6,33'/%3E%3Cpolygon points='60,22 98,42 98,78 60,98 22,78 22,42'/%3E%3C/g%3E%3C/svg%3E");
          background-size: 120px 120px;
        }
        .glow {
          position: fixed; width: 800px; height: 400px; border-radius: 50%;
          background: radial-gradient(ellipse, var(--msj-glow) 0%, transparent 70%);
          top: -100px; left: 50%; transform: translateX(-50%); pointer-events: none;
          transition: background var(--msj-transition);
        }
        .bar { position: fixed; left: 0; right: 0; height: 2px; background: var(--msj-bar); }
        .bar-t { top: 0; } .bar-b { bottom: 0; }

        .card { position: relative; width: 100%; max-width: 360px; animation: cardIn .7s cubic-bezier(.22,1,.36,1) both; }

        @keyframes cardIn { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shake  { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-6px)} 40%{transform:translateX(6px)} 60%{transform:translateX(-4px)} 80%{transform:translateX(4px)} }

        .card-body {
          background: var(--msj-card-bg);
          border: 1px solid var(--msj-card-border);
          border-radius: 22px; padding: 32px 28px 28px;
          backdrop-filter: blur(28px);
          box-shadow: var(--msj-card-shadow);
          position: relative; overflow: hidden;
          transition: background var(--msj-transition), border-color var(--msj-transition);
        }
        .card-body::before {
          content: ''; position: absolute; top: 0; left: 10%; right: 10%; height: 1px;
          background: linear-gradient(90deg, transparent, var(--msj-gold-border), transparent);
        }

        .corner { position: absolute; width: 26px; height: 26px; }
        .c-tl { top:11px; left:11px; }
        .c-tr { top:11px; right:11px; transform: scaleX(-1); }
        .c-bl { bottom:11px; left:11px; transform: scaleY(-1); }
        .c-br { bottom:11px; right:11px; transform: scale(-1,-1); }

        .back-btn {
          position: absolute; top: 14px; left: 14px;
          width: 32px; height: 32px;
          background: var(--msj-card-bg);
          border: 1px solid var(--msj-card-border);
          border-radius: 10px; display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: all .2s; z-index: 2;
        }
        .back-btn:hover { background: var(--msj-gold-bg); border-color: var(--msj-gold-border); }

        .header { text-align: center; margin-bottom: 24px; animation: fadeUp .7s .08s cubic-bezier(.22,1,.36,1) both; }
        .lock-icon {
          width: 52px; height: 52px;
          background: var(--msj-gold-bg);
          border: 1px solid var(--msj-gold-border);
          border-radius: 16px; display: flex; align-items: center; justify-content: center;
          margin: 0 auto 14px;
          box-shadow: var(--msj-card-shadow);
          transition: all var(--msj-transition);
        }
        .al-title { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 700; color: var(--msj-text-title); margin-bottom: 4px; transition: color var(--msj-transition); }
        .al-sub   { font-size: 11.5px; color: var(--msj-text-sub); letter-spacing: .3px; transition: color var(--msj-transition); }

        .pin-display { display: flex; justify-content: center; gap: 10px; margin-bottom: 6px; animation: fadeUp .7s .14s cubic-bezier(.22,1,.36,1) both; }
        .pin-dot     { width: 14px; height: 14px; border-radius: 50%; border: 1.5px solid; transition: all .2s cubic-bezier(.34,1.56,.64,1); }
        .do-shake    { animation: shake .4s ease; }

        .pin-hint { text-align: center; font-size: 11px; color: var(--msj-text-muted); margin-bottom: 22px; min-height: 16px; animation: fadeUp .7s .16s cubic-bezier(.22,1,.36,1) both; transition: color var(--msj-transition); }
        .hint-err { color: #e08080 !important; }
        .hint-ok  { color: #7ecf9a !important; }

        .divider  { display: flex; align-items: center; gap: 8px; margin-bottom: 18px; animation: fadeUp .7s .18s cubic-bezier(.22,1,.36,1) both; }
        .dline    { flex: 1; height: 1px; }
        .dl       { background: var(--msj-divider-line-l); }
        .dr       { background: var(--msj-divider-line-r); }
        .dtext    { font-size: 9px; color: var(--msj-divider-text); letter-spacing: 2.5px; text-transform: uppercase; white-space: nowrap; transition: color var(--msj-transition); }

        .numpad { display: grid; grid-template-columns: repeat(3,1fr); gap: 10px; animation: fadeUp .7s .2s cubic-bezier(.22,1,.36,1) both; }
        .num-btn {
          aspect-ratio: 1;
          background: var(--msj-card-bg);
          border: 1px solid var(--msj-card-border);
          border-radius: 14px; color: var(--msj-text-title);
          font-family: 'Plus Jakarta Sans', sans-serif; font-size: 20px; font-weight: 500;
          cursor: pointer; display: flex; flex-direction: column; align-items: center; justify-content: center;
          transition: all .15s; user-select: none;
        }
        .num-btn .nsub { font-size: 7px; letter-spacing: 1.5px; color: var(--msj-text-muted); font-weight: 600; text-transform: uppercase; margin-top: 1px; transition: color var(--msj-transition); }
        .num-btn:hover  { background: var(--msj-gold-bg); border-color: var(--msj-gold-border); transform: scale(1.03); }
        .num-btn:active { background: var(--msj-gold-bg); border-color: var(--msj-gold-bright); transform: scale(.95); }
        .num-btn:disabled { opacity: .25; pointer-events: none; }

        .enter-btn {
          grid-column: span 3; padding: 14px;
          background: var(--msj-enter-bg);
          border: 1px solid var(--msj-gold-border);
          border-radius: 14px; color: var(--msj-text-title);
          font-family: 'Plus Jakarta Sans', sans-serif; font-size: 13px; font-weight: 600;
          letter-spacing: 1.5px; text-transform: uppercase;
          cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: all .2s; margin-top: 2px;
        }
        .enter-btn:hover    { border-color: var(--msj-gold-bright); box-shadow: 0 6px 24px rgba(0,0,0,.2); transform: translateY(-1px); }
        .enter-btn:disabled { opacity: .35; cursor: not-allowed; transform: none; }

        .al-footer { text-align: center; margin-top: 20px; font-size: 10px; color: var(--msj-text-muted); animation: fadeUp .7s .28s cubic-bezier(.22,1,.36,1) both; transition: color var(--msj-transition); }
        .al-footer span { color: var(--msj-gold-text); }

        /* Dark mode */
        :root {
          --msj-enter-bg: linear-gradient(135deg,#122b1c 0%,#1a4a2d 40%,#122b1c 100%);
        }
        html:not(.dark) {
          --msj-enter-bg: linear-gradient(135deg,#d4e8dc 0%,#b8d4c4 40%,#d4e8dc 100%);
        }
      `}</style>

      <div className="al-root">
        <div className="bg-base"/><div className="bg-pat"/><div className="glow"/>
        <div className="bar bar-t"/><div className="bar bar-b"/>

        <div className="card">
          <div className="card-body">
            {(["c-tl","c-tr","c-bl","c-br"] as const).map((cls) => (
              <div key={cls} className={`corner ${cls}`}>
                <svg viewBox="0 0 26 26" fill="none">
                  <path d="M2 24L2 2L24 2" stroke="var(--msj-gold-bright)" strokeWidth="1.2" opacity="0.4"/>
                  <circle cx="6" cy="6" r="1.8" fill="none" stroke="var(--msj-gold-bright)" strokeWidth="0.9" opacity="0.45"/>
                  <circle cx="6" cy="6" r="0.6" fill="var(--msj-gold-bright)" opacity="0.55"/>
                </svg>
              </div>
            ))}

            <button className="back-btn" onClick={() => router.back()}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="var(--msj-gold-text)" strokeWidth="1.5" strokeLinecap="round">
                <path d="M9 11L5 7l4-4"/>
              </svg>
            </button>

            <div className="header">
              <div className="lock-icon">
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="var(--msj-gold-bright)" strokeWidth="1.6">
                  <rect x="4" y="10" width="14" height="10" rx="2.5"/>
                  <path d="M7 10V7a4 4 0 018 0v3"/>
                  <circle cx="11" cy="15.5" r="1.2" fill="var(--msj-gold-bright)" stroke="none"/>
                </svg>
              </div>
              <div className="al-title">Masuk Admin</div>
              <div className="al-sub">Masjid Jami' Nuril Anwar</div>
            </div>

            <div className={`pin-display ${shake ? "do-shake" : ""}`}>
              {Array.from({length:6}).map((_,i) => (
                <div key={i} className="pin-dot" style={dotStyle(i)}/>
              ))}
            </div>
            <div className={`pin-hint ${status==="error"?"hint-err":status==="success"?"hint-ok":""}`}>{hintText()}</div>

            <div className="divider">
              <div className="dline dl"/>
              <span className="dtext">✦ Numpad ✦</span>
              <div className="dline dr"/>
            </div>

            <div className="numpad">
              {numpad.map(([num,sub]) => (
                <button key={num} className="num-btn" onClick={()=>pressNum(num)} disabled={status==="success"}>
                  {num}{sub&&<span className="nsub">{sub}</span>}
                </button>
              ))}
              <button className="num-btn" disabled/>
              <button className="num-btn" onClick={()=>pressNum("0")} disabled={status==="success"}>0</button>
              <button className="num-btn" onClick={deleteLast} disabled={status==="success"}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="var(--msj-gold-text)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 5H8L3 10l5 5h6a2 2 0 002-2V7a2 2 0 00-2-2z"/>
                  <line x1="12" y1="8" x2="8" y2="12"/><line x1="8" y1="8" x2="12" y2="12"/>
                </svg>
              </button>
              <button className="enter-btn" onClick={()=>handleSubmit(pin)} disabled={pin.length<6||status!=="idle"}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="var(--msj-text-title)" strokeWidth="1.5">
                  <rect x="2" y="6" width="10" height="7" rx="1.5"/>
                  <path d="M4.5 6V4.5a2.5 2.5 0 015 0V6"/>
                </svg>
                {status==="success" ? "Mengalihkan..." : "Masuk"}
              </button>
            </div>
          </div>

          <div className="al-footer">Hanya untuk <span>Admin DKM</span> yang berwenang</div>
        </div>
      </div>
    </>
  );
}