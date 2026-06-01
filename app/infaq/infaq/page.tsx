"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, TrendingUp, TrendingDown } from "lucide-react";

type Infaq = {
  id: number;
  keterangan: string;
  jumlah: number;
  tipe: "masuk" | "keluar";
  tanggal: string;
};

const fmt    = (n: number) => new Intl.NumberFormat("id-ID").format(n);
const fmtTgl = (t: string) => new Date(t).toLocaleDateString("id-ID", { day:"numeric", month:"long", year:"numeric" });

export default function InfaqPage() {
  const [list, setList]       = useState<Infaq[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState<"semua"|"masuk"|"keluar">("semua");

  useEffect(() => {
    fetch("/api/infaq")
      .then(r => r.json())
      .then(d => { setList(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const masuk  = list.filter(i => i.tipe === "masuk").reduce((a,b)  => a + b.jumlah, 0);
  const keluar = list.filter(i => i.tipe === "keluar").reduce((a,b) => a + b.jumlah, 0);
  const saldo  = masuk - keluar;
  const persen = masuk > 0 ? Math.min(Math.round((keluar / masuk) * 100), 100) : 0;
  const filtered = list.filter(i => filter === "semua" ? true : i.tipe === filter);

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700&family=Nunito:wght@400;500;600;700;800&family=Amiri:wght@400;700&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        :root { --g:#166534; --g2:#15803d; --gold:#d4a732; --gold2:#f0c84e; --ink:#0f1f0f; --bg:#f0faf4; }
        html { -webkit-tap-highlight-color:transparent; }
        body { background:var(--bg); font-family:'Nunito',sans-serif; color:var(--ink); }

        .if-header {
          background:linear-gradient(160deg,#0c3d20,#166534 50%,#14532d);
          padding:52px 20px 28px; border-radius:0 0 36px 36px;
          box-shadow:0 12px 40px rgba(22,101,52,.35); position:relative; overflow:hidden;
        }
        .if-header::before {
          content:''; position:absolute; inset:0; pointer-events:none;
          background:radial-gradient(ellipse 70% 60% at 80% 20%, rgba(212,167,50,.12) 0%, transparent 70%);
        }
        .back-btn {
          display:inline-flex; align-items:center; gap:6px;
          color:rgba(255,255,255,.7); text-decoration:none;
          font-size:13px; font-weight:700; margin-bottom:16px;
        }
        .saldo-main {
          background:rgba(212,167,50,.15); border:1px solid rgba(212,167,50,.3);
          border-radius:20px; padding:18px; margin-top:16px; position:relative; z-index:1;
        }
        .saldo-grid { display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:14px; }
        .saldo-box  { border-radius:14px; padding:12px; display:flex; flex-direction:column; gap:3px; }
        .progress-wrap { height:6px; background:rgba(255,255,255,.15); border-radius:10px; overflow:hidden; margin-top:12px; }
        .progress-fill { height:100%; border-radius:10px; background:linear-gradient(90deg,var(--gold),var(--gold2)); transition:width .8s ease; }

        .filter-bar {
          display:flex; background:#fff; border-radius:16px; padding:4px; gap:4px;
          border:1px solid rgba(22,101,52,.1); box-shadow:0 2px 10px rgba(0,0,0,.05);
          margin:20px 0 16px;
        }
        .filter-btn {
          flex:1; padding:9px 6px; border-radius:12px; border:none;
          font-family:'Nunito',sans-serif; font-size:12px; font-weight:800;
          cursor:pointer; transition:all .2s;
        }
        .filter-btn.active { background:linear-gradient(135deg,var(--g),var(--g2)); color:#fff; box-shadow:0 3px 10px rgba(22,101,52,.25); }
        .filter-btn:not(.active) { background:transparent; color:#9ca3af; }
        .filter-btn:active { transform:scale(.96); }

        .tx-card {
          background:#fff; border-radius:16px; padding:14px 16px;
          border:1px solid rgba(22,101,52,.08); box-shadow:0 2px 8px rgba(0,0,0,.04);
          margin-bottom:8px; display:flex; align-items:center; gap:12px;
        }
        .tx-icon { width:40px; height:40px; border-radius:12px; flex-shrink:0; display:flex; align-items:center; justify-content:center; }
        .tx-icon.masuk  { background:rgba(22,101,52,.1); }
        .tx-icon.keluar { background:rgba(239,68,68,.08); }

        .skeleton {
          background:linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%);
          background-size:200% 100%; animation:shimmer 1.5s infinite;
          border-radius:16px; height:70px; margin-bottom:8px;
        }
        @keyframes shimmer { 0%{background-position:200% 0;} 100%{background-position:-200% 0;} }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(12px);} to{opacity:1;transform:translateY(0);} }
        .fade-in { animation:fadeUp .35s ease both; }
      `}</style>

      <main style={{ minHeight:"100vh", paddingBottom:40 }}>
        <div className="if-header">
          <div style={{ maxWidth:480, margin:"0 auto", position:"relative", zIndex:1 }}>
            <Link href="/home" className="back-btn"><ArrowLeft size={16} /> Kembali</Link>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <div style={{
                width:50, height:50, borderRadius:16, flexShrink:0,
                background:"rgba(212,167,50,.15)", border:"1px solid rgba(212,167,50,.3)",
                display:"flex", alignItems:"center", justifyContent:"center", fontSize:24,
              }}>💰</div>
              <div>
                <h1 style={{ fontFamily:"'Cinzel',serif", fontSize:20, fontWeight:700, color:"#fff" }}>Kas & Infaq</h1>
                <p style={{ fontSize:12, color:"rgba(255,255,255,.5)", marginTop:3 }}>Transparansi keuangan masjid</p>
              </div>
            </div>

            {/* SALDO */}
            <div className="saldo-main">
              <p style={{ fontSize:10, fontWeight:800, textTransform:"uppercase", letterSpacing:"1.5px", color:"rgba(212,167,50,.7)", marginBottom:4 }}>Saldo Kas Masjid</p>
              <p style={{ fontFamily:"'Cinzel',serif", fontSize:32, fontWeight:700, color:"#fff", letterSpacing:"-1px" }}>Rp {fmt(saldo)}</p>
              <div className="saldo-grid">
                <div className="saldo-box" style={{ background:"rgba(34,197,94,.15)", border:"1px solid rgba(34,197,94,.2)" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                    <TrendingUp size={12} color="#4ade80" />
                    <span style={{ fontSize:10, fontWeight:800, color:"#4ade80", textTransform:"uppercase" }}>Masuk</span>
                  </div>
                  <p style={{ fontSize:15, fontWeight:800, color:"#fff" }}>Rp {fmt(masuk)}</p>
                </div>
                <div className="saldo-box" style={{ background:"rgba(239,68,68,.15)", border:"1px solid rgba(239,68,68,.2)" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                    <TrendingDown size={12} color="#f87171" />
                    <span style={{ fontSize:10, fontWeight:800, color:"#f87171", textTransform:"uppercase" }}>Keluar</span>
                  </div>
                  <p style={{ fontSize:15, fontWeight:800, color:"#fff" }}>Rp {fmt(keluar)}</p>
                </div>
              </div>
              <div style={{ marginTop:12 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                  <span style={{ fontSize:10, color:"rgba(255,255,255,.5)" }}>Penggunaan dana</span>
                  <span style={{ fontSize:10, fontWeight:800, color:"rgba(212,167,50,.8)" }}>{persen}%</span>
                </div>
                <div className="progress-wrap">
                  <div className="progress-fill" style={{ width:`${persen}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ maxWidth:480, margin:"0 auto", padding:"0 16px" }}>

          {/* INFO */}
          <div style={{ marginTop:20, background:"rgba(212,167,50,.08)", border:"1px solid rgba(212,167,50,.2)", borderRadius:16, padding:"12px 16px", display:"flex", gap:10 }} className="fade-in">
            <span style={{ fontSize:18, flexShrink:0 }}>📋</span>
            <p style={{ fontSize:12, color:"#6b7280", lineHeight:1.7 }}>
              Laporan keuangan ini dikelola secara transparan oleh DKM Masjid Jami' Nuril Anwar dan diperbarui secara berkala.
            </p>
          </div>

          {/* FILTER */}
          <div className="filter-bar">
            {(["semua","masuk","keluar"] as const).map(f => (
              <button key={f} className={`filter-btn${filter===f?" active":""}`} onClick={() => setFilter(f)}>
                {f==="semua" ? "📊 Semua" : f==="masuk" ? "💰 Masuk" : "💸 Keluar"}
              </button>
            ))}
          </div>

          {/* LIST */}
          {loading && <><div className="skeleton"/><div className="skeleton"/><div className="skeleton"/></>}

          {!loading && filtered.length === 0 && (
            <div style={{ textAlign:"center", padding:"40px 20px" }}>
              <p style={{ fontSize:32, marginBottom:8 }}>📭</p>
              <p style={{ fontSize:14, fontWeight:700 }}>Belum ada data</p>
              <p style={{ fontSize:12, color:"#9ca3af", marginTop:4 }}>DKM belum mencatat transaksi</p>
            </div>
          )}

          {!loading && filtered.map((item, i) => (
            <div key={item.id} className="tx-card fade-in" style={{ animationDelay:`${i*0.04}s` }}>
              <div className={`tx-icon ${item.tipe}`}>
                {item.tipe==="masuk"
                  ? <TrendingUp size={18} color="var(--g2)" />
                  : <TrendingDown size={18} color="#ef4444" />}
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <p style={{ fontSize:13, fontWeight:700, color:"var(--ink)", marginBottom:2 }}>{item.keterangan}</p>
                <p style={{ fontSize:11, color:"#9ca3af" }}>{fmtTgl(item.tanggal)}</p>
              </div>
              <div style={{ textAlign:"right", flexShrink:0 }}>
                <p style={{ fontSize:14, fontWeight:800, color:item.tipe==="masuk"?"var(--g)":"#dc2626" }}>
                  {item.tipe==="masuk"?"+":"-"}Rp {fmt(item.jumlah)}
                </p>
                <span style={{
                  fontSize:10, fontWeight:800, padding:"2px 8px", borderRadius:20,
                  background:item.tipe==="masuk"?"rgba(22,101,52,.08)":"rgba(239,68,68,.08)",
                  color:item.tipe==="masuk"?"var(--g2)":"#ef4444",
                }}>
                  {item.tipe==="masuk"?"▲ Masuk":"▼ Keluar"}
                </span>
              </div>
            </div>
          ))}

          {/* DONASI CTA */}
          {!loading && (
            <Link href="/donasi" style={{ textDecoration:"none" }}>
              <div style={{
                marginTop:16, marginBottom:8,
                background:"linear-gradient(135deg,#7a0e2a,#c0152f)",
                borderRadius:20, padding:"18px 20px",
                display:"flex", alignItems:"center", justifyContent:"space-between",
                border:"1px solid rgba(255,255,255,.1)",
                boxShadow:"0 8px 24px rgba(122,14,42,.25)",
              }} className="fade-in">
                <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                  <span style={{ fontSize:28 }}>💝</span>
                  <div>
                    <p style={{ fontSize:14, fontWeight:800, color:"#fff" }}>Ingin Berdonasi?</p>
                    <p style={{ fontSize:11, color:"rgba(255,255,255,.55)", marginTop:2 }}>Scan QRIS atau transfer bank</p>
                  </div>
                </div>
                <div style={{ background:"rgba(255,255,255,.15)", borderRadius:20, padding:"7px 14px", fontSize:12, fontWeight:800, color:"#fff" }}>
                  Donasi →
                </div>
              </div>
            </Link>
          )}
        </div>
      </main>
    </>
  );
}