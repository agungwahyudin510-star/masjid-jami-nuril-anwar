"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  MapPin,
  Clock,
  User,
  CalendarDays,
} from "lucide-react";


type Kajian = {
  id: number;
  judul: string;
  ustadz: string;
  tanggal: string;
  waktu: string;
  tempat: string;
};

function formatTanggal(tanggal: string) {
  return new Date(tanggal).toLocaleDateString("id-ID", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
}

function getCountdown(tanggal: string, waktu: string) {
  const [jam, menit] = waktu.split(":").map(Number);
  const target = new Date(tanggal);
  target.setHours(jam, menit, 0, 0);
  const diff = target.getTime() - new Date().getTime();
  if (diff <= 0) return null;
  const hari  = Math.floor(diff / (1000 * 60 * 60 * 24));
  const jam2  = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const menit2 = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (hari > 0)  return `${hari} hari ${jam2} jam lagi`;
  if (jam2 > 0)  return `${jam2} jam ${menit2} menit lagi`;
  return `${menit2} menit lagi`;
}

function isUpcoming(tanggal: string, waktu: string) {
  const [jam, menit] = waktu.split(":").map(Number);
  const target = new Date(tanggal);
  target.setHours(jam, menit, 0, 0);
  return target > new Date();
}

export default function KajianPage() {
  const [kajianList, setKajianList] = useState<Kajian[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");

  useEffect(() => {
    fetch("/api/kajian")
      .then(r => r.json())
      .then(data => { setKajianList(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => { setError("Gagal memuat data kajian."); setLoading(false); });
  }, []);

  const upcoming = kajianList.filter(k => isUpcoming(k.tanggal, k.waktu));
  const past     = kajianList.filter(k => !isUpcoming(k.tanggal, k.waktu));
  const next     = upcoming[0];

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700&family=Nunito:wght@400;500;600;700;800&family=Amiri:wght@400;700&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        :root { --g:#166534; --g2:#15803d; --gold:#d4a732; --gold2:#f0c84e; --ink:#0f1f0f; --bg:#f0faf4; }
        html { -webkit-tap-highlight-color:transparent; }
        body { background:var(--bg); font-family:'Nunito',sans-serif; color:var(--ink); }

        .kj-header {
          background: linear-gradient(160deg,#2d1069,#4a2090 50%,#1e0848);
          padding: 52px 20px 24px;
          border-radius: 0 0 32px 32px;
          box-shadow: 0 10px 32px rgba(45,16,105,.35);
          position: relative; overflow: hidden;
        }
        .kj-header::before {
          content:''; position:absolute; inset:0;
          background: radial-gradient(ellipse 60% 60% at 80% 20%, rgba(212,167,50,.12) 0%, transparent 70%);
          pointer-events:none;
        }
        .back-btn {
          display:inline-flex; align-items:center; gap:6px;
          color:rgba(255,255,255,.7); text-decoration:none;
          font-size:13px; font-weight:700; margin-bottom:16px;
        }
        .next-card {
          background: linear-gradient(135deg,rgba(212,167,50,.2),rgba(212,167,50,.08));
          border: 1px solid rgba(212,167,50,.35);
          border-radius: 20px; padding: 18px; margin-top: 16px; position:relative; z-index:1;
        }
        .countdown-badge {
          display:inline-flex; align-items:center; gap:5px;
          background: rgba(212,167,50,.25); border:1px solid rgba(212,167,50,.4);
          border-radius:20px; padding:4px 10px;
          font-size:11px; font-weight:800; color:var(--gold2); margin-bottom:10px;
        }
        .section-head {
          display:flex; align-items:center; gap:8px;
          margin:24px 0 12px; padding:0 2px;
          font-size:11px; font-weight:800; letter-spacing:2px; text-transform:uppercase; color:var(--g2);
        }
        .section-head::before { content:'✦'; color:var(--gold); font-size:10px; }
        .kajian-card {
          background:#fff; border-radius:20px; padding:18px;
          border:1px solid rgba(22,101,52,.1);
          box-shadow:0 3px 14px rgba(0,0,0,.05); margin-bottom:12px;
          transition:transform .15s;
        }
        .kajian-card:active { transform:scale(.98); }
        .kajian-card.upcoming { border-left:4px solid var(--g2); }
        .kajian-card.past     { opacity:.6; border-left:4px solid #d1d5db; }
        .tag {
          display:inline-flex; align-items:center; gap:4px;
          border-radius:20px; padding:3px 10px;
          font-size:10px; font-weight:800; text-transform:uppercase; letter-spacing:.5px; margin-bottom:8px;
        }
        .tag.upcoming { background:rgba(22,101,52,.1); color:var(--g2); }
        .tag.past     { background:rgba(0,0,0,.06); color:#6b7280; }
        .info-row {
          display:flex; align-items:center; gap:6px;
          font-size:12px; color:#6b7280; margin-top:5px;
        }
        .skeleton {
          background:linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%);
          background-size:200% 100%; animation:shimmer 1.5s infinite;
          border-radius:16px; height:100px; margin-bottom:12px;
        }
        @keyframes shimmer { 0%{background-position:200% 0;} 100%{background-position:-200% 0;} }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(12px);} to{opacity:1;transform:translateY(0);} }
        .fade-in { animation:fadeUp .35s ease both; }
      `}</style>

      <main style={{ minHeight:"100vh", paddingBottom:40 }}>
        <div className="kj-header">
          <div style={{ maxWidth:480, margin:"0 auto", position:"relative", zIndex:1 }}>
            <Link href="/home" className="back-btn"><ArrowLeft size={16} /> Kembali</Link>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <div style={{
                width:50, height:50, borderRadius:16, flexShrink:0,
                background:"rgba(212,167,50,.15)", border:"1px solid rgba(212,167,50,.3)",
                display:"flex", alignItems:"center", justifyContent:"center", fontSize:24,
              }}>🎤</div>
              <div>
                <h1 style={{ fontFamily:"'Cinzel',serif", fontSize:20, fontWeight:700, color:"#fff" }}>Kajian Masjid</h1>
                <p style={{ fontSize:12, color:"rgba(255,255,255,.5)", marginTop:3 }}>Jami' Nuril Anwar — Karawang</p>
              </div>
            </div>
            {next && (
              <div className="next-card">
                <div className="countdown-badge">⏰ {getCountdown(next.tanggal, next.waktu) ?? "Segera"}</div>
                <p style={{ fontSize:16, fontWeight:800, color:"#fff", marginBottom:6 }}>{next.judul}</p>
                <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                  <User size={12} color="rgba(255,255,255,.5)" />
                  <span style={{ fontSize:12, color:"rgba(255,255,255,.6)" }}>{next.ustadz}</span>
                  <span style={{ color:"rgba(255,255,255,.3)" }}>·</span>
                  <Clock size={12} color="rgba(255,255,255,.5)" />
                  <span style={{ fontSize:12, color:"rgba(255,255,255,.6)" }}>{next.waktu} WIB</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div style={{ maxWidth:480, margin:"0 auto", padding:"0 16px" }}>
          {loading && <><div className="skeleton" /><div className="skeleton" /><div className="skeleton" /></>}
          {error && <p style={{ marginTop:24, textAlign:"center", color:"#ef4444", fontSize:14 }}>{error}</p>}

          {!loading && !error && (
            <>
              <div className="section-head">Kajian Mendatang</div>
              {upcoming.length === 0 ? (
                <div style={{ textAlign:"center", padding:"40px 20px", background:"#fff", borderRadius:20, border:"1px dashed rgba(22,101,52,.2)" }} className="fade-in">
                  <p style={{ fontSize:32, marginBottom:8 }}>📅</p>
                  <p style={{ fontSize:14, fontWeight:700 }}>Belum ada jadwal kajian</p>
                  <p style={{ fontSize:12, color:"#6b7280", marginTop:4 }}>DKM akan segera menambahkan jadwal</p>
                </div>
              ) : upcoming.map(k => (
                <div key={k.id} className="kajian-card upcoming fade-in">
                  <div className="tag upcoming">✦ Mendatang</div>
                  <p style={{ fontSize:15, fontWeight:800, color:"var(--ink)", marginBottom:4 }}>{k.judul}</p>
                  <div className="info-row"><User size={12} color="var(--g2)" /><span style={{ fontWeight:600, color:"var(--g)" }}>{k.ustadz}</span></div>
                  <div className="info-row"><CalendarDays size={12} /><span>{formatTanggal(k.tanggal)}</span></div>
                  <div className="info-row"><Clock size={12} /><span>{k.waktu} WIB</span></div>
                  {k.tempat && <div className="info-row"><MapPin size={12} /><span>{k.tempat}</span></div>}
                  {getCountdown(k.tanggal, k.waktu) && (
                    <div style={{ marginTop:10, display:"inline-flex", alignItems:"center", gap:5, background:"rgba(22,101,52,.08)", borderRadius:20, padding:"4px 10px" }}>
                      <span style={{ fontSize:11, fontWeight:800, color:"var(--g2)" }}>⏰ {getCountdown(k.tanggal, k.waktu)}</span>
                    </div>
                  )}
                </div>
              ))}

              {past.length > 0 && (
                <>
                  <div className="section-head">Kajian Sebelumnya</div>
                  {past.map(k => (
                    <div key={k.id} className="kajian-card past fade-in">
                      <div className="tag past">✓ Selesai</div>
                      <p style={{ fontSize:14, fontWeight:800, color:"var(--ink)", marginBottom:4 }}>{k.judul}</p>
                      <div className="info-row"><User size={12} /><span>{k.ustadz}</span></div>
                      <div className="info-row"><CalendarDays size={12} /><span>{formatTanggal(k.tanggal)}</span></div>
                      <div className="info-row"><Clock size={12} /><span>{k.waktu} WIB</span></div>
                      {k.tempat && <div className="info-row"><MapPin size={12} /><span>{k.tempat}</span></div>}
                    </div>
                  ))}
                </>
              )}

              <div style={{ marginTop:16, marginBottom:8, background:"rgba(212,167,50,.08)", border:"1px solid rgba(212,167,50,.2)", borderRadius:16, padding:"12px 16px", display:"flex", gap:10 }} className="fade-in">
                <span style={{ fontSize:18, flexShrink:0 }}>💡</span>
                <p style={{ fontSize:12, color:"#6b7280", lineHeight:1.7 }}>
                  Jadwal kajian dikelola langsung oleh DKM Masjid Jami' Nuril Anwar. Informasi dapat berubah sewaktu-waktu.
                </p>
              </div>
            </>
          )}
        </div>
      </main>
    </>
  );
}