"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useTheme } from "@/lib/ThemeContext";

export default function RootPage() {
  const router = useRouter();
  const { dark, toggleTheme } = useTheme();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace("/home");
    });
  }, [router]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Playfair+Display:wght@600;700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .root-page {
          min-height: 100vh;
          background: var(--msj-bg);
          display: flex; align-items: center; justify-content: center;
          font-family: 'Plus Jakarta Sans', sans-serif;
          position: relative; overflow: hidden; padding: 24px;
        }
        .bg-base {
          position: fixed; inset: 0;
          background: var(--msj-bg-gradient);
        }
        .bg-pattern {
          position: fixed; inset: 0;
          opacity: var(--msj-pattern-opacity);
          background-image: url("data:image/svg+xml,%3Csvg width='120' height='120' viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23c9a84c' stroke-width='0.6'%3E%3Cpolygon points='60,6 114,33 114,87 60,114 6,87 6,33'/%3E%3Cpolygon points='60,22 98,42 98,78 60,98 22,78 22,42'/%3E%3Cpolygon points='60,38 82,50 82,70 60,82 38,70 38,50'/%3E%3C/g%3E%3C/svg%3E");
          background-size: 120px 120px;
        }
        .glow {
          position: fixed; width: 700px; height: 400px; border-radius: 50%;
          background: radial-gradient(ellipse, var(--msj-glow) 0%, transparent 70%);
          top: -80px; left: 50%; transform: translateX(-50%); pointer-events: none;
        }
        .bar { position: fixed; left: 0; right: 0; height: 2px; background: var(--msj-bar); }
        .bar-top { top: 0; } .bar-bottom { bottom: 0; }

        /* Toggle */
        .theme-toggle {
          position: fixed; top: 16px; right: 16px; z-index: 100;
          width: 40px; height: 40px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          border: 1px solid var(--msj-toggle-border);
          background: var(--msj-toggle-bg);
          color: var(--msj-toggle-color);
          backdrop-filter: blur(8px);
        }
        .theme-toggle:hover { transform: scale(1.08); }

        .wrap {
          position: relative; z-index: 1; width: 100%; max-width: 400px;
          animation: cardIn 0.7s cubic-bezier(0.22,1,0.36,1) both;
        }
        @keyframes cardIn { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes float   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
        @keyframes pulse   { 0%,100%{opacity:1} 50%{opacity:0.3} }

        .rp-header { text-align: center; margin-bottom: 32px; animation: fadeUp 0.7s 0.05s cubic-bezier(0.22,1,0.36,1) both; }
        .bismillah { font-family: 'Amiri', serif; font-size: 17px; color: var(--msj-bismillah); margin-bottom: 18px; }
        .dome-svg  { display: block; margin: 0 auto 14px; filter: drop-shadow(0 0 14px rgba(201,168,76,0.25)); animation: float 4s ease-in-out infinite; }
        .masjid-title { font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 700; color: var(--msj-text-title); margin-bottom: 4px; }
        .masjid-sub   { font-size: 12px; color: var(--msj-text-sub); letter-spacing: 0.5px; margin-bottom: 10px; }
        .rp-badge {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 4px 14px; border: 1px solid var(--msj-gold-border);
          border-radius: 20px; font-size: 10px; font-weight: 600;
          letter-spacing: 2px; text-transform: uppercase; color: var(--msj-gold-text);
        }
        .rp-dot { width: 5px; height: 5px; border-radius: 50%; background: #2ecc71; box-shadow: 0 0 6px #2ecc71; animation: pulse 2s infinite; }

        .rp-divider { display: flex; align-items: center; gap: 10px; margin-bottom: 20px; animation: fadeUp 0.7s 0.12s cubic-bezier(0.22,1,0.36,1) both; }
        .rp-dline   { flex: 1; height: 1px; }
        .rp-dl { background: var(--msj-divider-line-l); }
        .rp-dr { background: var(--msj-divider-line-r); }
        .rp-dtext { font-size: 9px; color: var(--msj-divider-text); letter-spacing: 2.5px; text-transform: uppercase; white-space: nowrap; }

        .roles { display: flex; flex-direction: column; gap: 12px; animation: fadeUp 0.7s 0.18s cubic-bezier(0.22,1,0.36,1) both; }

        .role-card {
          background: var(--msj-card-bg);
          border: 1px solid var(--msj-card-border);
          border-radius: 18px; padding: 20px;
          display: flex; align-items: center; gap: 16px;
          cursor: pointer; transition: all 0.25s;
          position: relative; overflow: hidden;
        }
        .role-card::after {
          content: ''; position: absolute; left: 0; top: 15%; bottom: 15%;
          width: 3px; border-radius: 0 3px 3px 0;
          opacity: 0; transform: scaleY(0.2); transition: all 0.25s;
        }
        .role-admin::after  { background: linear-gradient(180deg, #c9a84c, #f0d080); }
        .role-jemaah::after { background: linear-gradient(180deg, #2ecc71, #27ae60); }
        .role-card:hover::after { opacity: 1; transform: scaleY(1); }
        .role-card:active { transform: translateX(2px) scale(0.99); }

        .role-admin:hover  { border-color: var(--msj-admin-hover-border); transform: translateX(4px); box-shadow: var(--msj-admin-hover-shadow); }
        .role-jemaah:hover { border-color: var(--msj-jemaah-hover-border); transform: translateX(4px); box-shadow: var(--msj-jemaah-hover-shadow); }

        .role-icon  { width: 52px; height: 52px; border-radius: 15px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; }
        .ri-admin   { background: var(--msj-admin-icon-bg); border: 1px solid var(--msj-admin-icon-border); }
        .ri-jemaah  { background: var(--msj-jemaah-icon-bg); border: 1px solid var(--msj-jemaah-icon-border); }

        .role-text  { flex: 1; }
        .role-title { font-size: 15px; font-weight: 700; margin-bottom: 4px; color: var(--msj-text-title); }
        .rt-jemaah  { color: var(--msj-green-text) !important; }
        .role-desc  { font-size: 11.5px; color: var(--msj-text-desc); line-height: 1.4; }

        .role-arrow { opacity: 0.25; transition: all 0.25s; flex-shrink: 0; }
        .role-card:hover .role-arrow { opacity: 0.8; transform: translateX(4px); }

        .rp-footer { text-align: center; margin-top: 24px; font-family: 'Amiri', serif; font-size: 13px; color: var(--msj-footer-arabic); animation: fadeUp 0.7s 0.28s cubic-bezier(0.22,1,0.36,1) both; }
      `}</style>

      <div className="root-page">
        <div className="bg-base" />
        <div className="bg-pattern" />
        <div className="glow" />
        <div className="bar bar-top" />
        <div className="bar bar-bottom" />

        {/* Toggle */}
        <button className="theme-toggle" onClick={toggleTheme} aria-label={dark ? "Mode terang" : "Mode gelap"}>
          {dark ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="4"/>
              <line x1="12" y1="2"  x2="12" y2="5"/>
              <line x1="12" y1="19" x2="12" y2="22"/>
              <line x1="4.22" y1="4.22"   x2="6.34" y2="6.34"/>
              <line x1="17.66" y1="17.66" x2="19.78" y2="19.78"/>
              <line x1="2"  y1="12" x2="5"  y2="12"/>
              <line x1="19" y1="12" x2="22" y2="12"/>
              <line x1="4.22"  y1="19.78" x2="6.34"  y2="17.66"/>
              <line x1="17.66" y1="6.34"  x2="19.78" y2="4.22"/>
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
            </svg>
          )}
        </button>

        <div className="wrap">
          <div className="rp-header">
            <div className="bismillah">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>
            <svg className="dome-svg" width="110" height="80" viewBox="0 0 130 90" fill="none">
              <rect x="3" y="42" width="14" height="38" rx="2" fill="var(--msj-svg-green)" stroke="#c9a84c" strokeWidth="0.7" opacity="0.8"/>
              <path d="M3 42 Q10 24 17 42Z" fill="#c9a84c" opacity="0.7"/>
              <rect x="5" y="16" width="10" height="9" rx="1.5" fill="#c9a84c" opacity="0.7"/>
              <line x1="10" y1="7" x2="10" y2="16" stroke="#c9a84c" strokeWidth="1.8"/>
              <polygon points="10,2 7.5,7 12.5,7" fill="#c9a84c"/>
              <rect x="113" y="42" width="14" height="38" rx="2" fill="var(--msj-svg-green)" stroke="#c9a84c" strokeWidth="0.7" opacity="0.8"/>
              <path d="M113 42 Q120 24 127 42Z" fill="#c9a84c" opacity="0.7"/>
              <rect x="115" y="16" width="10" height="9" rx="1.5" fill="#c9a84c" opacity="0.7"/>
              <line x1="120" y1="7" x2="120" y2="16" stroke="#c9a84c" strokeWidth="1.8"/>
              <polygon points="120,2 117.5,7 122.5,7" fill="#c9a84c"/>
              <path d="M22 60 Q22 18 65 14 Q108 18 108 60Z" fill="var(--msj-svg-green)" stroke="#c9a84c" strokeWidth="1"/>
              <path d="M30 60 Q30 26 65 22 Q100 26 100 60Z" fill="rgba(201,168,76,0.06)" stroke="rgba(201,168,76,0.2)" strokeWidth="0.7"/>
              <path d="M22 60 Q22 48 32 46 Q42 48 42 60Z" fill="var(--msj-svg-green)" stroke="#c9a84c" strokeWidth="0.7" opacity="0.8"/>
              <path d="M88 60 Q88 48 98 46 Q108 48 108 60Z" fill="var(--msj-svg-green)" stroke="#c9a84c" strokeWidth="0.7" opacity="0.8"/>
              <circle cx="65" cy="13" r="6" fill="none" stroke="#c9a84c" strokeWidth="1.3"/>
              <circle cx="67.5" cy="11.5" r="4.5" fill="var(--msj-svg-bg)"/>
              <polygon points="74,8 74.8,10.5 77.4,10.5 75.3,12 76.1,14.5 74,13 71.9,14.5 72.7,12 70.6,10.5 73.2,10.5" fill="#c9a84c" opacity="0.9"/>
              <rect x="18" y="60" width="94" height="6" rx="2" fill="#c9a84c" opacity="0.4"/>
              <rect x="14" y="66" width="102" height="4" rx="1.5" fill="#c9a84c" opacity="0.25"/>
              <path d="M53 60 Q53 46 65 44 Q77 46 77 60Z" fill="rgba(201,168,76,0.12)" stroke="rgba(201,168,76,0.35)" strokeWidth="0.8"/>
            </svg>
            <div className="masjid-title">Jami' Nuril Anwar</div>
            <div className="masjid-sub">Karawang, Jawa Barat</div>
            <div className="rp-badge"><span className="rp-dot" />Sistem Aktif</div>
          </div>

          <div className="rp-divider">
            <div className="rp-dline rp-dl" />
            <span className="rp-dtext">✦ Pilih Akses ✦</span>
            <div className="rp-dline rp-dr" />
          </div>

          <div className="roles">
            <div className="role-card role-admin" onClick={() => router.push("/admin-login")}>
              <div className="role-icon ri-admin">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.25C17.25 22.15 21 17.25 21 12V7L12 2z"/>
                  <path d="M9 12l2 2 4-4"/>
                </svg>
              </div>
              <div className="role-text">
                <div className="role-title">Masuk sebagai Admin</div>
                <div className="role-desc">Kelola kajian, infaq, pengumuman & pembangunan masjid</div>
              </div>
              <svg className="role-arrow" width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#c9a84c" strokeWidth="1.5">
                <path d="M7 5l4 4-4 4"/>
              </svg>
            </div>

            <div className="role-card role-jemaah" onClick={() => router.push("/splash")}>
              <div className="role-icon ri-jemaah">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2ecc71" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
                </svg>
              </div>
              <div className="role-text">
                <div className="role-title rt-jemaah">Masuk sebagai Jemaah</div>
                <div className="role-desc">Lihat jadwal, kajian, donasi & info masjid</div>
              </div>
              <svg className="role-arrow" width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#2ecc71" strokeWidth="1.5">
                <path d="M7 5l4 4-4 4"/>
              </svg>
            </div>
          </div>

          <div className="rp-footer">إِنَّمَا يَعْمُرُ مَسَاجِدَ اللَّهِ مَنْ آمَنَ بِاللَّهِ</div>
        </div>
      </div>
    </>
  );
}