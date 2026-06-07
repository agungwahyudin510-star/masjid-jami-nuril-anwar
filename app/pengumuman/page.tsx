"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Pengumuman = { id: number; judul: string; isi: string; tanggal: string; aktif: boolean; };
type Kajian = { id: number; judul: string; ustadz: string; tanggal: string; waktu: string; lokasi: string; deskripsi: string; aktif: boolean; };
type Infaq = { id: number; keterangan: string; jumlah: number; tipe: "masuk"|"keluar"; tanggal: string; };
type Pembangunan = { id: number; nama_proyek: string; deskripsi: string; target_dana: number; dana_terkumpul: number; progress: number; status: string; aktif: boolean; };

type Tab = "semua" | "pengumuman" | "kajian" | "infaq" | "pembangunan";

export default function PengumumanHubPage() {
  const [activeTab, setActiveTab] = useState<Tab>("semua");
  const [pengumuman, setPengumuman] = useState<Pengumuman[]>([]);
  const [kajian, setKajian] = useState<Kajian[]>([]);
  const [infaq, setInfaq] = useState<Infaq[]>([]);
  const [pembangunan, setPembangunan] = useState<Pembangunan[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  const fetchAll = async () => {
    const [p, k, i, pb] = await Promise.all([
      supabase.from("pengumuman").select("*").eq("aktif", true).order("tanggal", { ascending: false }),
      supabase.from("kajian").select("*").eq("aktif", true).order("tanggal", { ascending: false }),
      supabase.from("infaq").select("*").order("tanggal", { ascending: false }).limit(20),
      supabase.from("pembangunan").select("*").eq("aktif", true).order("tanggal_mulai", { ascending: false }),
    ]);
    setPengumuman(p.data || []);
    setKajian(k.data || []);
    setInfaq(i.data || []);
    setPembangunan(pb.data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
    const tables = ["pengumuman", "kajian", "infaq", "pembangunan"];
    const channels = tables.map(t =>
      supabase.channel(`hub-${t}`)
        .on("postgres_changes", { event: "*", schema: "public", table: t }, fetchAll)
        .subscribe()
    );
    return () => { channels.forEach(c => supabase.removeChannel(c)); };
  }, []);

  const formatTgl = (tgl: string) => new Date(tgl).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
  const formatRp = (n: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

  const tabs: { key: Tab; label: string; emoji: string; count: number }[] = [
    { key: "semua", label: "Semua", emoji: "📋", count: pengumuman.length + kajian.length + pembangunan.length },
    { key: "pengumuman", label: "Info", emoji: "📢", count: pengumuman.length },
    { key: "kajian", label: "Kajian", emoji: "🎤", count: kajian.length },
    { key: "infaq", label: "Infaq", emoji: "💰", count: infaq.length },
    { key: "pembangunan", label: "Bangun", emoji: "🏗️", count: pembangunan.length },
  ];

  const totalMasuk = infaq.filter(i => i.tipe === "masuk").reduce((a, b) => a + b.jumlah, 0);
  const totalKeluar = infaq.filter(i => i.tipe === "keluar").reduce((a, b) => a + b.jumlah, 0);
  const saldo = totalMasuk - totalKeluar;

  const showPengumuman = activeTab === "semua" || activeTab === "pengumuman";
  const showKajian = activeTab === "semua" || activeTab === "kajian";
  const showInfaq = activeTab === "semua" || activeTab === "infaq";
  const showPembangunan = activeTab === "semua" || activeTab === "pembangunan";

  const isEmpty = !loading && (
    (activeTab === "semua" && pengumuman.length === 0 && kajian.length === 0 && infaq.length === 0 && pembangunan.length === 0) ||
    (activeTab === "pengumuman" && pengumuman.length === 0) ||
    (activeTab === "kajian" && kajian.length === 0) ||
    (activeTab === "infaq" && infaq.length === 0) ||
    (activeTab === "pembangunan" && pembangunan.length === 0)
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Playfair+Display:wght@600;700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        .hub-root{min-height:100vh;background:#060f09;font-family:'Plus Jakarta Sans',sans-serif;position:relative;overflow-x:hidden;padding-bottom:80px;}
        .bg-base{position:fixed;inset:0;background:radial-gradient(ellipse 100% 50% at 50% 0%,#0d2e18 0%,#060f09 55%);z-index:0;}
        .bg-pat{position:fixed;inset:0;opacity:.03;z-index:0;background-image:url("data:image/svg+xml,%3Csvg width='120' height='120' viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23c9a84c' stroke-width='0.6'%3E%3Cpolygon points='60,6 114,33 114,87 60,114 6,87 6,33'/%3E%3C/g%3E%3C/svg%3E");background-size:120px 120px;}
        .bar{position:fixed;left:0;right:0;height:2px;z-index:10;background:linear-gradient(90deg,transparent,#b8962e 20%,#f0d080 50%,#b8962e 80%,transparent);}
        .bar-t{top:0;}.bar-b{bottom:0;}
        .page{position:relative;z-index:1;max-width:430px;margin:0 auto;padding:0;}
        @keyframes fadeDown{from{opacity:0;transform:translateY(-14px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}

        /* Header */
        .hub-header{padding:24px 20px 16px;animation:fadeDown .6s cubic-bezier(.22,1,.36,1) both;}
        .bismillah{font-family:'Amiri',serif;font-size:14px;color:rgba(201,168,76,.55);text-align:center;margin-bottom:14px;}
        .header-title{font-family:'Playfair Display',serif;font-size:22px;color:#e8d8a0;font-weight:700;margin-bottom:3px;}
        .header-sub{font-size:11px;color:rgba(255,255,255,.3);}

        /* Tabs */
        .tabs-wrap{padding:0 20px;margin-bottom:20px;animation:fadeUp .6s .06s cubic-bezier(.22,1,.36,1) both;}
        .tabs{display:flex;gap:8px;overflow-x:auto;padding-bottom:4px;scrollbar-width:none;}
        .tabs::-webkit-scrollbar{display:none;}
        .tab-btn{display:flex;align-items:center;gap:5px;padding:7px 14px;border-radius:20px;font-size:12px;font-weight:600;cursor:pointer;transition:all .2s;white-space:nowrap;flex-shrink:0;border:1px solid;}
        .tab-btn.active{background:rgba(201,168,76,.15);border-color:rgba(201,168,76,.35);color:#e8d8a0;}
        .tab-btn.inactive{background:rgba(255,255,255,.04);border-color:rgba(255,255,255,.08);color:rgba(255,255,255,.4);}
        .tab-count{font-size:10px;padding:1px 6px;border-radius:10px;background:rgba(255,255,255,.1);}
        .tab-btn.active .tab-count{background:rgba(201,168,76,.2);color:#c9a84c;}

        /* Section label */
        .sec-label{display:flex;align-items:center;gap:8px;padding:0 20px;margin-bottom:10px;}
        .sec-line{flex:1;height:1px;}
        .sl-left{background:linear-gradient(90deg,transparent,rgba(201,168,76,.2));}
        .sl-right{background:linear-gradient(90deg,rgba(201,168,76,.2),transparent);}
        .sec-text{font-size:9px;color:rgba(201,168,76,.4);letter-spacing:2.5px;text-transform:uppercase;white-space:nowrap;}

        /* Cards */
        .cards{display:flex;flex-direction:column;gap:10px;padding:0 20px;margin-bottom:20px;}

        /* Pengumuman card */
        .p-card{background:rgba(255,255,255,.03);border:1px solid rgba(201,168,76,.1);border-radius:16px;overflow:hidden;cursor:pointer;transition:all .2s;}
        .p-card:hover{border-color:rgba(201,168,76,.22);}
        .p-card.open{border-color:rgba(201,168,76,.28);}
        .p-card::before{content:'';display:block;height:1px;background:linear-gradient(90deg,transparent,rgba(201,168,76,.18),transparent);}
        .p-top{padding:14px 16px;display:flex;align-items:flex-start;gap:10px;}
        .p-dot{width:7px;height:7px;border-radius:50%;background:#c9a84c;box-shadow:0 0 6px rgba(201,168,76,.5);flex-shrink:0;margin-top:5px;}
        .p-main{flex:1;min-width:0;}
        .p-judul{font-size:13.5px;font-weight:600;color:#e8d8a0;margin-bottom:3px;line-height:1.3;}
        .p-tgl{font-size:10px;color:rgba(201,168,76,.4);}
        .p-chev{opacity:.3;transition:transform .2s;flex-shrink:0;}
        .p-card.open .p-chev{transform:rotate(180deg);}
        .p-body{padding:0 16px 14px 33px;font-size:12.5px;color:rgba(255,255,255,.5);line-height:1.7;border-top:1px solid rgba(255,255,255,.05);}
        .p-body-inner{padding-top:10px;}

        /* Kajian card */
        .k-card{background:rgba(255,255,255,.03);border:1px solid rgba(52,152,219,.12);border-radius:16px;padding:14px 16px;cursor:pointer;transition:all .2s;overflow:hidden;}
        .k-card:hover{border-color:rgba(52,152,219,.25);}
        .k-card.open{border-color:rgba(52,152,219,.3);}
        .k-top{display:flex;align-items:flex-start;gap:12px;}
        .k-date{background:rgba(52,152,219,.1);border:1px solid rgba(52,152,219,.2);border-radius:10px;padding:8px;text-align:center;min-width:44px;flex-shrink:0;}
        .k-day{font-size:18px;font-weight:700;color:#e8d8a0;line-height:1;}
        .k-mon{font-size:8px;font-weight:600;color:rgba(52,152,219,.7);text-transform:uppercase;letter-spacing:.8px;margin-top:2px;}
        .k-info{flex:1;min-width:0;}
        .k-judul{font-size:13.5px;font-weight:600;color:#e8d8a0;margin-bottom:4px;line-height:1.3;}
        .k-meta{font-size:11px;color:rgba(255,255,255,.35);display:flex;flex-direction:column;gap:2px;}
        .k-body{margin-top:10px;padding-top:10px;border-top:1px solid rgba(255,255,255,.05);font-size:12px;color:rgba(255,255,255,.45);line-height:1.6;}
        .upcoming{font-size:9px;font-weight:700;padding:2px 8px;border-radius:20px;background:rgba(46,204,113,.12);color:#2ecc71;border:1px solid rgba(46,204,113,.2);white-space:nowrap;flex-shrink:0;}

        /* Infaq saldo */
        .saldo-card{background:rgba(46,204,113,.06);border:1px solid rgba(46,204,113,.15);border-radius:16px;padding:16px;margin-bottom:10px;}
        .saldo-top{text-align:center;margin-bottom:12px;}
        .saldo-label{font-size:9.5px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:rgba(46,204,113,.5);margin-bottom:4px;}
        .saldo-value{font-family:'Playfair Display',serif;font-size:24px;font-weight:700;color:#e8d8a0;}
        .saldo-row{display:grid;grid-template-columns:1fr 1fr;gap:8px;}
        .saldo-mini{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:10px;padding:10px;text-align:center;}
        .sm-label{font-size:9px;font-weight:600;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;}
        .sm-masuk{color:rgba(46,204,113,.5);}
        .sm-keluar{color:rgba(231,76,60,.5);}
        .sm-value{font-size:13px;font-weight:700;}

        /* Infaq list */
        .i-card{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);border-radius:12px;padding:12px 14px;display:flex;align-items:center;gap:10px;}
        .i-icon{width:32px;height:32px;border-radius:9px;display:flex;align-items:center;justify-content:center;font-size:13px;flex-shrink:0;}
        .ii-masuk{background:rgba(46,204,113,.1);border:1px solid rgba(46,204,113,.2);}
        .ii-keluar{background:rgba(231,76,60,.1);border:1px solid rgba(231,76,60,.2);}
        .i-info{flex:1;min-width:0;}
        .i-ket{font-size:12.5px;font-weight:600;color:#e8d8a0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
        .i-tgl{font-size:10px;color:rgba(255,255,255,.3);margin-top:1px;}
        .i-jml{font-size:13px;font-weight:700;white-space:nowrap;}
        .jm{color:#2ecc71;}.jk{color:#e74c3c;}

        /* Pembangunan card */
        .pb-card{background:rgba(255,255,255,.03);border:1px solid rgba(155,89,182,.12);border-radius:16px;padding:16px;}
        .pb-top{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;margin-bottom:10px;}
        .pb-nama{font-size:14px;font-weight:700;color:#e8d8a0;line-height:1.3;}
        .pb-status{font-size:9px;font-weight:700;padding:3px 9px;border-radius:20px;white-space:nowrap;flex-shrink:0;}
        .pb-desc{font-size:12px;color:rgba(255,255,255,.35);margin-bottom:12px;line-height:1.5;}
        .pb-prog-head{display:flex;justify-content:space-between;margin-bottom:6px;}
        .pb-prog-label{font-size:10px;color:rgba(255,255,255,.3);font-weight:600;}
        .pb-prog-pct{font-size:14px;font-weight:700;color:#9b59b6;}
        .pb-prog-bg{height:6px;background:rgba(255,255,255,.06);border-radius:6px;overflow:hidden;margin-bottom:12px;}
        .pb-prog-fill{height:100%;border-radius:6px;background:linear-gradient(90deg,#9b59b6,#c39bd3);}
        .pb-dana{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;}
        .pb-dana-item{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:10px;padding:10px;text-align:center;}
        .pb-dana-label{font-size:8.5px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:rgba(255,255,255,.25);margin-bottom:4px;}
        .pb-dana-value{font-size:11.5px;font-weight:700;color:#e8d8a0;}

        .empty{text-align:center;padding:48px 20px;color:rgba(255,255,255,.2);}
        .empty-icon{font-size:36px;opacity:.3;margin-bottom:12px;}
        .loading{text-align:center;padding:64px 20px;color:rgba(201,168,76,.35);}
        .spinner{width:22px;height:22px;border:2px solid rgba(201,168,76,.15);border-top-color:#c9a84c;border-radius:50%;animation:spin .7s linear infinite;margin:0 auto 12px;}
      `}</style>

      <div className="hub-root">
        <div className="bg-base"/><div className="bg-pat"/>
        <div className="bar bar-t"/><div className="bar bar-b"/>

        <div className="page">
          {/* Header */}
          <div className="hub-header">
            <div className="bismillah">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>
            <div className="header-title">Info & Update</div>
            <div className="header-sub">Semua informasi terbaru dari DKM Masjid Jami' Nuril Anwar</div>
          </div>

          {/* Tabs */}
          <div className="tabs-wrap">
            <div className="tabs">
              {tabs.map(t => (
                <button key={t.key} className={`tab-btn ${activeTab === t.key ? "active" : "inactive"}`} onClick={() => setActiveTab(t.key)}>
                  {t.emoji} {t.label}
                  {t.count > 0 && <span className="tab-count">{t.count}</span>}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="loading"><div className="spinner"/><div>Memuat data...</div></div>
          ) : isEmpty ? (
            <div className="empty"><div className="empty-icon">📋</div><div>Belum ada data</div></div>
          ) : (
            <>
              {/* PENGUMUMAN */}
              {showPengumuman && pengumuman.length > 0 && (
                <>
                  <div className="sec-label">
                    <div className="sec-line sl-left"/>
                    <span className="sec-text">✦ Pengumuman ✦</span>
                    <div className="sec-line sl-right"/>
                  </div>
                  <div className="cards">
                    {pengumuman.map(item => (
                      <div key={`p-${item.id}`} className={`p-card ${expanded === `p-${item.id}` ? "open" : ""}`}
                        onClick={() => setExpanded(expanded === `p-${item.id}` ? null : `p-${item.id}`)}>
                        <div className="p-top">
                          <div className="p-dot"/>
                          <div className="p-main">
                            <div className="p-judul">{item.judul}</div>
                            <div className="p-tgl">{formatTgl(item.tanggal)}</div>
                          </div>
                          <svg className="p-chev" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="rgba(201,168,76,0.5)" strokeWidth="1.5"><path d="M4 6l4 4 4-4"/></svg>
                        </div>
                        {expanded === `p-${item.id}` && (
                          <div className="p-body"><div className="p-body-inner">{item.isi}</div></div>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* KAJIAN */}
              {showKajian && kajian.length > 0 && (
                <>
                  <div className="sec-label">
                    <div className="sec-line sl-left"/>
                    <span className="sec-text">✦ Jadwal Kajian ✦</span>
                    <div className="sec-line sl-right"/>
                  </div>
                  <div className="cards">
                    {kajian.map(item => {
                      const d = new Date(item.tanggal);
                      const upcoming = new Date(item.tanggal) >= new Date();
                      return (
                        <div key={`k-${item.id}`} className={`k-card ${expanded === `k-${item.id}` ? "open" : ""}`}
                          onClick={() => setExpanded(expanded === `k-${item.id}` ? null : `k-${item.id}`)}>
                          <div className="k-top">
                            <div className="k-date">
                              <div className="k-day">{d.getDate()}</div>
                              <div className="k-mon">{d.toLocaleDateString("id-ID",{month:"short"})}</div>
                            </div>
                            <div className="k-info">
                              <div className="k-judul">{item.judul}</div>
                              <div className="k-meta">
                                <span>🕐 {item.waktu} · {item.ustadz}</span>
                                <span>📍 {item.lokasi}</span>
                              </div>
                            </div>
                            {upcoming && <span className="upcoming">Akan Datang</span>}
                          </div>
                          {expanded === `k-${item.id}` && item.deskripsi && (
                            <div className="k-body">{item.deskripsi}</div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}

              {/* INFAQ */}
              {showInfaq && infaq.length > 0 && (
                <>
                  <div className="sec-label">
                    <div className="sec-line sl-left"/>
                    <span className="sec-text">✦ Saldo Infaq ✦</span>
                    <div className="sec-line sl-right"/>
                  </div>
                  <div className="cards">
                    <div className="saldo-card">
                      <div className="saldo-top">
                        <div className="saldo-label">Saldo Saat Ini</div>
                        <div className="saldo-value">{formatRp(saldo)}</div>
                      </div>
                      <div className="saldo-row">
                        <div className="saldo-mini"><div className="sm-label sm-masuk">Masuk</div><div className="sm-value" style={{color:"#2ecc71"}}>{formatRp(totalMasuk)}</div></div>
                        <div className="saldo-mini"><div className="sm-label sm-keluar">Keluar</div><div className="sm-value" style={{color:"#e74c3c"}}>{formatRp(totalKeluar)}</div></div>
                      </div>
                    </div>
                    {infaq.slice(0, activeTab === "infaq" ? infaq.length : 5).map(item => (
                      <div key={`i-${item.id}`} className="i-card">
                        <div className={`i-icon ${item.tipe==="masuk"?"ii-masuk":"ii-keluar"}`}>{item.tipe==="masuk"?"↓":"↑"}</div>
                        <div className="i-info">
                          <div className="i-ket">{item.keterangan}</div>
                          <div className="i-tgl">{formatTgl(item.tanggal)}</div>
                        </div>
                        <div className={`i-jml ${item.tipe==="masuk"?"jm":"jk"}`}>{item.tipe==="masuk"?"+":"-"}{formatRp(item.jumlah)}</div>
                      </div>
                    ))}
                    {activeTab === "semua" && infaq.length > 5 && (
                      <button onClick={() => setActiveTab("infaq")} style={{background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.08)",borderRadius:10,padding:"10px",color:"rgba(255,255,255,.4)",fontSize:12,cursor:"pointer",width:"100%"}}>
                        Lihat semua {infaq.length} transaksi →
                      </button>
                    )}
                  </div>
                </>
              )}

              {/* PEMBANGUNAN */}
              {showPembangunan && pembangunan.length > 0 && (
                <>
                  <div className="sec-label">
                    <div className="sec-line sl-left"/>
                    <span className="sec-text">✦ Info Pembangunan ✦</span>
                    <div className="sec-line sl-right"/>
                  </div>
                  <div className="cards">
                    {pembangunan.map(item => {
                      const kurang = Math.max(0, item.target_dana - item.dana_terkumpul);
                      const sc = item.status === "selesai"
                        ? { color:"#2ecc71", bg:"rgba(46,204,113,.12)", border:"rgba(46,204,113,.2)" }
                        : item.status === "ditunda"
                        ? { color:"#e74c3c", bg:"rgba(231,76,60,.12)", border:"rgba(231,76,60,.2)" }
                        : { color:"#c9a84c", bg:"rgba(201,168,76,.12)", border:"rgba(201,168,76,.2)" };
                      return (
                        <div key={`pb-${item.id}`} className="pb-card">
                          <div className="pb-top">
                            <div className="pb-nama">{item.nama_proyek}</div>
                            <span className="pb-status" style={{background:sc.bg,color:sc.color,border:`1px solid ${sc.border}`}}>{item.status}</span>
                          </div>
                          {item.deskripsi && <div className="pb-desc">{item.deskripsi}</div>}
                          <div className="pb-prog-head">
                            <span className="pb-prog-label">Progress</span>
                            <span className="pb-prog-pct">{item.progress}%</span>
                          </div>
                          <div className="pb-prog-bg"><div className="pb-prog-fill" style={{width:`${item.progress}%`}}/></div>
                          <div className="pb-dana">
                            <div className="pb-dana-item"><div className="pb-dana-label">Target</div><div className="pb-dana-value">{formatRp(item.target_dana)}</div></div>
                            <div className="pb-dana-item"><div className="pb-dana-label">Terkumpul</div><div className="pb-dana-value" style={{color:"#2ecc71"}}>{formatRp(item.dana_terkumpul)}</div></div>
                            <div className="pb-dana-item"><div className="pb-dana-label">Kurang</div><div className="pb-dana-value" style={{color:kurang>0?"#e74c3c":"#2ecc71"}}>{formatRp(kurang)}</div></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}