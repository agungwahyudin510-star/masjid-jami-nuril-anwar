"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Pembangunan = {
  id: number;
  nama_proyek: string;
  deskripsi: string;
  target_dana: number;
  dana_terkumpul: number;
  progress: number;
  status: "berjalan" | "selesai" | "ditunda";
  tanggal_mulai: string;
  aktif: boolean;
};

export default function PembangunanPage() {
  const [list, setList] = useState<Pembangunan[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    const { data } = await supabase
      .from("pembangunan")
      .select("*")
      .eq("aktif", true)
      .order("tanggal_mulai", { ascending: false });
    setList(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    const channel = supabase
      .channel("pembangunan-jemaah")
      .on("postgres_changes", { event: "*", schema: "public", table: "pembangunan" }, () => fetchData())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const formatRp = (n: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

  const statusConfig = (s: string) => {
    if (s === "selesai") return { color: "#2ecc71", bg: "rgba(46,204,113,.12)", border: "rgba(46,204,113,.2)", label: "Selesai" };
    if (s === "ditunda") return { color: "#e74c3c", bg: "rgba(231,76,60,.12)", border: "rgba(231,76,60,.2)", label: "Ditunda" };
    return { color: "#c9a84c", bg: "rgba(201,168,76,.12)", border: "rgba(201,168,76,.2)", label: "Berjalan" };
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Playfair+Display:wght@600;700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        .pb-root{min-height:100vh;background:#060f09;font-family:'Plus Jakarta Sans',sans-serif;position:relative;overflow-x:hidden;padding-bottom:80px;}
        .bg-base{position:fixed;inset:0;background:radial-gradient(ellipse 100% 50% at 50% 0%,#0d2e18 0%,#060f09 55%);z-index:0;}
        .bg-pat{position:fixed;inset:0;opacity:.03;z-index:0;background-image:url("data:image/svg+xml,%3Csvg width='120' height='120' viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23c9a84c' stroke-width='0.6'%3E%3Cpolygon points='60,6 114,33 114,87 60,114 6,87 6,33'/%3E%3C/g%3E%3C/svg%3E");background-size:120px 120px;}
        .bar{position:fixed;left:0;right:0;height:2px;z-index:10;background:linear-gradient(90deg,transparent,#b8962e 20%,#f0d080 50%,#b8962e 80%,transparent);}
        .bar-t{top:0;}.bar-b{bottom:0;}
        .page{position:relative;z-index:1;max-width:430px;margin:0 auto;padding:0;}
        @keyframes fadeDown{from{opacity:0;transform:translateY(-14px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fillBar{from{width:0}to{width:var(--w)}}

        .pb-header{padding:24px 20px 16px;animation:fadeDown .6s cubic-bezier(.22,1,.36,1) both;}
        .bismillah{font-family:'Amiri',serif;font-size:14px;color:rgba(201,168,76,.55);text-align:center;margin-bottom:14px;}
        .header-title{font-family:'Playfair Display',serif;font-size:22px;color:#e8d8a0;font-weight:700;margin-bottom:3px;}
        .header-sub{font-size:11px;color:rgba(255,255,255,.3);}

        .divider{display:flex;align-items:center;gap:10px;padding:0 20px;margin-bottom:16px;animation:fadeUp .6s .08s cubic-bezier(.22,1,.36,1) both;}
        .dline{flex:1;height:1px;}.dl{background:linear-gradient(90deg,transparent,rgba(201,168,76,.22));}.dr{background:linear-gradient(90deg,rgba(201,168,76,.22),transparent);}
        .dtext{font-size:9px;color:rgba(201,168,76,.35);letter-spacing:2.5px;text-transform:uppercase;white-space:nowrap;}

        .list{display:flex;flex-direction:column;gap:14px;padding:0 20px;animation:fadeUp .6s .12s cubic-bezier(.22,1,.36,1) both;}

        .item-card{background:rgba(255,255,255,.03);border:1px solid rgba(201,168,76,.1);border-radius:18px;padding:20px;position:relative;overflow:hidden;}
        .item-card::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(201,168,76,.2),transparent);}

        .item-top{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;margin-bottom:12px;}
        .item-nama{font-family:'Playfair Display',serif;font-size:16px;font-weight:700;color:#e8d8a0;line-height:1.3;}
        .item-status{font-size:9px;font-weight:700;padding:4px 10px;border-radius:20px;white-space:nowrap;flex-shrink:0;text-transform:uppercase;letter-spacing:.5px;}

        .item-desc{font-size:12.5px;color:rgba(255,255,255,.38);line-height:1.6;margin-bottom:16px;}

        /* Progress */
        .progress-wrap{margin-bottom:16px;}
        .progress-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;}
        .progress-title{font-size:10.5px;font-weight:600;letter-spacing:1px;text-transform:uppercase;color:rgba(255,255,255,.3);}
        .progress-pct{font-size:18px;font-weight:700;color:#9b59b6;}
        .progress-bg{height:8px;background:rgba(255,255,255,.06);border-radius:8px;overflow:hidden;}
        .progress-fill{height:100%;border-radius:8px;background:linear-gradient(90deg,#9b59b6,#c39bd3);animation:fillBar .8s ease both;}

        /* Dana cards */
        .dana-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;}
        .dana-card{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:12px;padding:12px;text-align:center;}
        .dana-label{font-size:9px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;color:rgba(255,255,255,.25);margin-bottom:5px;}
        .dana-value{font-size:12px;font-weight:700;color:#e8d8a0;}

        .empty{text-align:center;padding:64px 20px;color:rgba(255,255,255,.2);animation:fadeUp .6s .1s cubic-bezier(.22,1,.36,1) both;}
        .empty-icon{font-size:40px;opacity:.3;margin-bottom:14px;}
        .loading{text-align:center;padding:64px 20px;color:rgba(201,168,76,.35);}
        .spinner{width:22px;height:22px;border:2px solid rgba(201,168,76,.15);border-top-color:#c9a84c;border-radius:50%;animation:spin .7s linear infinite;margin:0 auto 12px;}
      `}</style>

      <div className="pb-root">
        <div className="bg-base"/><div className="bg-pat"/>
        <div className="bar bar-t"/><div className="bar bar-b"/>

        <div className="page">
          <div className="pb-header">
            <div className="bismillah">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>
            <div className="header-title">Info Pembangunan</div>
            <div className="header-sub">Progress pembangunan Masjid Jami' Nuril Anwar</div>
          </div>

          <div className="divider">
            <div className="dline dl"/><span className="dtext">✦ Progress Terkini ✦</span><div className="dline dr"/>
          </div>

          {loading ? (
            <div className="loading"><div className="spinner"/><div>Memuat data...</div></div>
          ) : list.length === 0 ? (
            <div className="empty">
              <div className="empty-icon">🏗️</div>
              <div style={{fontSize:14,marginBottom:6}}>Belum ada info pembangunan</div>
              <div style={{fontSize:11,opacity:.6}}>Info akan muncul setelah admin menambahkan data</div>
            </div>
          ) : (
            <div className="list">
              {list.map((item) => {
                const sc = statusConfig(item.status);
                const kurang = Math.max(0, item.target_dana - item.dana_terkumpul);
                return (
                  <div key={item.id} className="item-card">
                    <div className="item-top">
                      <div className="item-nama">{item.nama_proyek}</div>
                      <span className="item-status" style={{background:sc.bg,color:sc.color,border:`1px solid ${sc.border}`}}>
                        {sc.label}
                      </span>
                    </div>

                    {item.deskripsi && <div className="item-desc">{item.deskripsi}</div>}

                    <div className="progress-wrap">
                      <div className="progress-header">
                        <span className="progress-title">Progress Pembangunan</span>
                        <span className="progress-pct">{item.progress}%</span>
                      </div>
                      <div className="progress-bg">
                        <div className="progress-fill" style={{"--w":`${item.progress}%`,width:`${item.progress}%`} as React.CSSProperties}/>
                      </div>
                    </div>

                    <div className="dana-grid">
                      <div className="dana-card">
                        <div className="dana-label">Target</div>
                        <div className="dana-value">{formatRp(item.target_dana)}</div>
                      </div>
                      <div className="dana-card">
                        <div className="dana-label">Terkumpul</div>
                        <div className="dana-value" style={{color:"#2ecc71"}}>{formatRp(item.dana_terkumpul)}</div>
                      </div>
                      <div className="dana-card">
                        <div className="dana-label">Kurang</div>
                        <div className="dana-value" style={{color: kurang > 0 ? "#e74c3c" : "#2ecc71"}}>{formatRp(kurang)}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}