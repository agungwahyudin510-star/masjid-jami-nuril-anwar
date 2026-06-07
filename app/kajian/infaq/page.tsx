"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Infaq = { id: number; keterangan: string; jumlah: number; tipe: "masuk"|"keluar"; tanggal: string; };

export default function InfaqPage() {
  const [list, setList] = useState<Infaq[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    const { data } = await supabase
      .from("infaq").select("*")
      .order("tanggal", { ascending: false });
    setList(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    const channel = supabase
      .channel("infaq-jemaah")
      .on("postgres_changes", { event: "*", schema: "public", table: "infaq" }, () => fetchData())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const totalMasuk = list.filter(i => i.tipe === "masuk").reduce((a,b) => a + b.jumlah, 0);
  const totalKeluar = list.filter(i => i.tipe === "keluar").reduce((a,b) => a + b.jumlah, 0);
  const saldo = totalMasuk - totalKeluar;

  const formatRp = (n: number) => new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",maximumFractionDigits:0}).format(n);
  const formatTgl = (tgl: string) => new Date(tgl).toLocaleDateString("id-ID",{day:"numeric",month:"short",year:"numeric"});

  // Group by bulan
  const grouped = list.reduce((acc, item) => {
    const key = new Date(item.tanggal).toLocaleDateString("id-ID",{month:"long",year:"numeric"});
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {} as Record<string, Infaq[]>);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Playfair+Display:wght@600;700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        .if-root{min-height:100vh;background:#060f09;font-family:'Plus Jakarta Sans',sans-serif;position:relative;overflow-x:hidden;padding-bottom:80px;}
        .bg-base{position:fixed;inset:0;background:radial-gradient(ellipse 100% 50% at 50% 0%,#0d2e18 0%,#060f09 55%);z-index:0;}
        .bar{position:fixed;left:0;right:0;height:2px;z-index:10;background:linear-gradient(90deg,transparent,#b8962e 20%,#f0d080 50%,#b8962e 80%,transparent);}
        .bar-t{top:0;}.bar-b{bottom:0;}
        .page{position:relative;z-index:1;max-width:430px;margin:0 auto;padding:0;}
        @keyframes fadeDown{from{opacity:0;transform:translateY(-14px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}

        .if-header{padding:24px 20px 16px;animation:fadeDown .6s cubic-bezier(.22,1,.36,1) both;}
        .bismillah{font-family:'Amiri',serif;font-size:14px;color:rgba(201,168,76,.55);text-align:center;margin-bottom:14px;}
        .header-title{font-family:'Playfair Display',serif;font-size:22px;color:#e8d8a0;font-weight:700;margin-bottom:3px;}
        .header-sub{font-size:11px;color:rgba(255,255,255,.3);}

        /* Saldo cards */
        .saldo-section{padding:0 20px;margin-bottom:20px;animation:fadeUp .6s .05s cubic-bezier(.22,1,.36,1) both;}
        .saldo-main{background:rgba(201,168,76,.07);border:1px solid rgba(201,168,76,.18);border-radius:16px;padding:20px;text-align:center;margin-bottom:10px;position:relative;overflow:hidden;}
        .saldo-main::before{content:'';position:absolute;top:0;left:10%;right:10%;height:1px;background:linear-gradient(90deg,transparent,rgba(201,168,76,.35),transparent);}
        .saldo-label{font-size:10px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:rgba(201,168,76,.5);margin-bottom:8px;}
        .saldo-value{font-family:'Playfair Display',serif;font-size:28px;font-weight:700;color:#e8d8a0;}
        .saldo-row{display:grid;grid-template-columns:1fr 1fr;gap:10px;}
        .saldo-card{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);border-radius:13px;padding:14px;text-align:center;}
        .sc-label{font-size:9.5px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:6px;}
        .sc-masuk{color:rgba(46,204,113,.55);}
        .sc-keluar{color:rgba(231,76,60,.55);}
        .sc-value{font-size:14px;font-weight:700;}

        .divider{display:flex;align-items:center;gap:10px;padding:0 20px;margin-bottom:14px;animation:fadeUp .6s .1s cubic-bezier(.22,1,.36,1) both;}
        .dline{flex:1;height:1px;}.dl{background:linear-gradient(90deg,transparent,rgba(201,168,76,.22));}.dr{background:linear-gradient(90deg,rgba(201,168,76,.22),transparent);}
        .dtext{font-size:9px;color:rgba(201,168,76,.35);letter-spacing:2.5px;text-transform:uppercase;white-space:nowrap;}

        .group{margin-bottom:20px;padding:0 20px;animation:fadeUp .6s .14s cubic-bezier(.22,1,.36,1) both;}
        .group-label{font-size:10px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:rgba(201,168,76,.4);margin-bottom:10px;}
        .group-list{display:flex;flex-direction:column;gap:8px;}

        .item-card{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);border-radius:13px;padding:13px;display:flex;align-items:center;gap:12px;}
        .item-icon{width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:15px;flex-shrink:0;}
        .icon-masuk{background:rgba(46,204,113,.1);border:1px solid rgba(46,204,113,.2);}
        .icon-keluar{background:rgba(231,76,60,.1);border:1px solid rgba(231,76,60,.2);}
        .item-info{flex:1;min-width:0;}
        .item-ket{font-size:13px;font-weight:600;color:#e8d8a0;margin-bottom:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
        .item-tgl{font-size:10.5px;color:rgba(255,255,255,.3);}
        .item-jumlah{font-size:14px;font-weight:700;white-space:nowrap;}
        .jml-masuk{color:#2ecc71;}.jml-keluar{color:#e74c3c;}

        .empty{text-align:center;padding:64px 20px;color:rgba(255,255,255,.2);}
        .empty-icon{font-size:40px;opacity:.3;margin-bottom:14px;}
        .loading{text-align:center;padding:64px 20px;color:rgba(201,168,76,.35);}
        .spinner{width:22px;height:22px;border:2px solid rgba(201,168,76,.15);border-top-color:#c9a84c;border-radius:50%;animation:spin .7s linear infinite;margin:0 auto 12px;}
      `}</style>

      <div className="if-root">
        <div className="bg-base"/>
        <div className="bar bar-t"/><div className="bar bar-b"/>
        <div className="page">
          <div className="if-header">
            <div className="bismillah">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>
            <div className="header-title">Info Saldo Infaq</div>
            <div className="header-sub">Transparansi keuangan masjid</div>
          </div>

          {/* Saldo */}
          <div className="saldo-section">
            <div className="saldo-main">
              <div className="saldo-label">Saldo Saat Ini</div>
              <div className="saldo-value">{formatRp(saldo)}</div>
            </div>
            <div className="saldo-row">
              <div className="saldo-card">
                <div className="sc-label sc-masuk">Total Masuk</div>
                <div className="sc-value" style={{color:"#2ecc71"}}>{formatRp(totalMasuk)}</div>
              </div>
              <div className="saldo-card">
                <div className="sc-label sc-keluar">Total Keluar</div>
                <div className="sc-value" style={{color:"#e74c3c"}}>{formatRp(totalKeluar)}</div>
              </div>
            </div>
          </div>

          <div className="divider">
            <div className="dline dl"/><span className="dtext">✦ Riwayat Transaksi ✦</span><div className="dline dr"/>
          </div>

          {loading ? (
            <div className="loading"><div className="spinner"/><div>Memuat data...</div></div>
          ) : list.length === 0 ? (
            <div className="empty"><div className="empty-icon">💰</div><div>Belum ada transaksi</div></div>
          ) : (
            Object.entries(grouped).map(([bulan, items]) => (
              <div key={bulan} className="group">
                <div className="group-label">{bulan}</div>
                <div className="group-list">
                  {items.map((item) => (
                    <div key={item.id} className="item-card">
                      <div className={`item-icon ${item.tipe==="masuk"?"icon-masuk":"icon-keluar"}`}>
                        {item.tipe === "masuk" ? "↓" : "↑"}
                      </div>
                      <div className="item-info">
                        <div className="item-ket">{item.keterangan}</div>
                        <div className="item-tgl">{formatTgl(item.tanggal)}</div>
                      </div>
                      <div className={`item-jumlah ${item.tipe==="masuk"?"jml-masuk":"jml-keluar"}`}>
                        {item.tipe==="masuk"?"+":"-"}{formatRp(item.jumlah)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}