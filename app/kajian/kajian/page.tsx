"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Kajian = {
  id: number;
  judul: string;
  ustadz: string;
  tanggal: string;
  waktu: string;
  lokasi: string;
  deskripsi: string;
  aktif: boolean;
};

export default function KajianPage() {
  const [list, setList] = useState<Kajian[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);

  const fetchData = async () => {
    const { data } = await supabase
      .from("kajian")
      .select("*")
      .eq("aktif", true)
      .order("tanggal", { ascending: true });
    setList(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    const channel = supabase
      .channel("kajian-jemaah")
      .on("postgres_changes", { event: "*", schema: "public", table: "kajian" }, () => fetchData())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const formatTgl = (tgl: string) =>
    new Date(tgl).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  const isUpcoming = (tgl: string) => new Date(tgl) >= new Date();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Playfair+Display:wght@600;700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        .kj-root{min-height:100vh;background:#060f09;font-family:'Plus Jakarta Sans',sans-serif;position:relative;overflow-x:hidden;padding-bottom:80px;}
        .bg-base{position:fixed;inset:0;background:radial-gradient(ellipse 100% 50% at 50% 0%,#0d2e18 0%,#060f09 55%);z-index:0;}
        .bg-pat{position:fixed;inset:0;opacity:.03;z-index:0;background-image:url("data:image/svg+xml,%3Csvg width='120' height='120' viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23c9a84c' stroke-width='0.6'%3E%3Cpolygon points='60,6 114,33 114,87 60,114 6,87 6,33'/%3E%3C/g%3E%3C/svg%3E");background-size:120px 120px;}
        .bar{position:fixed;left:0;right:0;height:2px;z-index:10;background:linear-gradient(90deg,transparent,#b8962e 20%,#f0d080 50%,#b8962e 80%,transparent);}
        .bar-t{top:0;}.bar-b{bottom:0;}
        .page{position:relative;z-index:1;max-width:430px;margin:0 auto;padding:0;}
        @keyframes fadeDown{from{opacity:0;transform:translateY(-14px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}

        .kj-header{padding:24px 20px 16px;animation:fadeDown .6s cubic-bezier(.22,1,.36,1) both;}
        .bismillah{font-family:'Amiri',serif;font-size:14px;color:rgba(201,168,76,.55);text-align:center;margin-bottom:14px;}
        .header-title{font-family:'Playfair Display',serif;font-size:22px;color:#e8d8a0;font-weight:700;margin-bottom:3px;}
        .header-sub{font-size:11px;color:rgba(255,255,255,.3);}

        .divider{display:flex;align-items:center;gap:10px;padding:0 20px;margin-bottom:16px;animation:fadeUp .6s .08s cubic-bezier(.22,1,.36,1) both;}
        .dline{flex:1;height:1px;}.dl{background:linear-gradient(90deg,transparent,rgba(201,168,76,.22));}.dr{background:linear-gradient(90deg,rgba(201,168,76,.22),transparent);}
        .dtext{font-size:9px;color:rgba(201,168,76,.35);letter-spacing:2.5px;text-transform:uppercase;white-space:nowrap;}

        .list{display:flex;flex-direction:column;gap:12px;padding:0 20px;animation:fadeUp .6s .12s cubic-bezier(.22,1,.36,1) both;}

        .item-card{background:rgba(255,255,255,.03);border:1px solid rgba(201,168,76,.1);border-radius:18px;overflow:hidden;transition:all .25s;cursor:pointer;}
        .item-card:hover{border-color:rgba(201,168,76,.22);}
        .item-card.open{border-color:rgba(201,168,76,.28);}
        .item-card::before{content:'';display:block;height:1px;background:linear-gradient(90deg,transparent,rgba(201,168,76,.18),transparent);}

        .item-top{padding:16px;display:flex;align-items:flex-start;gap:14px;}
        .item-date-box{background:rgba(201,168,76,.08);border:1px solid rgba(201,168,76,.18);border-radius:12px;padding:10px;text-align:center;min-width:48px;flex-shrink:0;}
        .date-day{font-size:20px;font-weight:700;color:#e8d8a0;line-height:1;}
        .date-mon{font-size:9px;font-weight:600;color:rgba(201,168,76,.6);text-transform:uppercase;letter-spacing:1px;margin-top:2px;}
        .item-main{flex:1;min-width:0;}
        .item-judul{font-size:14px;font-weight:600;color:#e8d8a0;margin-bottom:5px;line-height:1.3;}
        .item-meta{display:flex;flex-direction:column;gap:3px;}
        .meta-row{display:flex;align-items:center;gap:5px;font-size:11px;color:rgba(255,255,255,.35);}
        .upcoming-badge{font-size:9px;font-weight:700;padding:2px 8px;border-radius:20px;background:rgba(46,204,113,.12);color:#2ecc71;border:1px solid rgba(46,204,113,.2);white-space:nowrap;flex-shrink:0;}
        .past-badge{font-size:9px;font-weight:700;padding:2px 8px;border-radius:20px;background:rgba(255,255,255,.06);color:rgba(255,255,255,.3);border:1px solid rgba(255,255,255,.08);white-space:nowrap;flex-shrink:0;}
        .chevron{opacity:.3;transition:transform .25s;margin-top:2px;flex-shrink:0;}
        .item-card.open .chevron{transform:rotate(180deg);}

        .item-body{padding:0 16px 16px 16px;border-top:1px solid rgba(255,255,255,.05);}
        .item-body-inner{padding-top:12px;font-size:13px;color:rgba(255,255,255,.5);line-height:1.7;}
        .lokasi-row{display:flex;align-items:center;gap:6px;font-size:12px;color:rgba(201,168,76,.5);margin-top:8px;}

        .empty{text-align:center;padding:64px 20px;color:rgba(255,255,255,.2);animation:fadeUp .6s .1s cubic-bezier(.22,1,.36,1) both;}
        .empty-icon{font-size:40px;opacity:.3;margin-bottom:14px;}
        .loading{text-align:center;padding:64px 20px;color:rgba(201,168,76,.35);}
        .spinner{width:22px;height:22px;border:2px solid rgba(201,168,76,.15);border-top-color:#c9a84c;border-radius:50%;animation:spin .7s linear infinite;margin:0 auto 12px;}
      `}</style>

      <div className="kj-root">
        <div className="bg-base"/><div className="bg-pat"/>
        <div className="bar bar-t"/><div className="bar bar-b"/>
        <div className="page">
          <div className="kj-header">
            <div className="bismillah">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>
            <div className="header-title">Jadwal Kajian</div>
            <div className="header-sub">Kajian rutin Masjid Jami' Nuril Anwar</div>
          </div>

          <div className="divider">
            <div className="dline dl"/><span className="dtext">✦ Jadwal Terkini ✦</span><div className="dline dr"/>
          </div>

          {loading ? (
            <div className="loading"><div className="spinner"/><div>Memuat jadwal...</div></div>
          ) : list.length === 0 ? (
            <div className="empty">
              <div className="empty-icon">🕌</div>
              <div style={{fontSize:14,marginBottom:6}}>Belum ada jadwal kajian</div>
              <div style={{fontSize:11,opacity:.6}}>Jadwal kajian akan muncul di sini</div>
            </div>
          ) : (
            <div className="list">
              {list.map((item) => {
                const d = new Date(item.tanggal);
                return (
                  <div key={item.id} className={`item-card ${expanded === item.id ? "open" : ""}`}
                    onClick={() => setExpanded(expanded === item.id ? null : item.id)}>
                    <div className="item-top">
                      <div className="item-date-box">
                        <div className="date-day">{d.getDate()}</div>
                        <div className="date-mon">{d.toLocaleDateString("id-ID",{month:"short"})}</div>
                      </div>
                      <div className="item-main">
                        <div className="item-judul">{item.judul}</div>
                        <div className="item-meta">
                          <div className="meta-row">
                            <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.4"><circle cx="5.5" cy="5.5" r="4.5"/><path d="M5.5 3v2.5l1.5 1.5"/></svg>
                            {item.waktu} WIB · {item.ustadz}
                          </div>
                          <div className="meta-row">
                            <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M9 4.5c0 3.5-3.5 5.5-3.5 5.5S2 8 2 4.5a3.5 3.5 0 017 0z"/><circle cx="5.5" cy="4.5" r="1.2"/></svg>
                            {item.lokasi}
                          </div>
                        </div>
                      </div>
                      <div>
                        {isUpcoming(item.tanggal)
                          ? <span className="upcoming-badge">Akan Datang</span>
                          : <span className="past-badge">Selesai</span>}
                        <svg className="chevron" style={{display:"block",marginTop:8}} width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="rgba(201,168,76,0.5)" strokeWidth="1.5"><path d="M4 6l4 4 4-4"/></svg>
                      </div>
                    </div>
                    {expanded === item.id && (
                      <div className="item-body">
                        <div className="item-body-inner">
                          <div><strong style={{color:"rgba(255,255,255,.7)"}}>Ustadz:</strong> {item.ustadz}</div>
                          <div style={{marginTop:4}}><strong style={{color:"rgba(255,255,255,.7)"}}>Tanggal:</strong> {formatTgl(item.tanggal)}</div>
                          {item.deskripsi && <div style={{marginTop:8}}>{item.deskripsi}</div>}
                          <div className="lokasi-row">
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M10 5c0 4-4 6-4 6S2 9 2 5a4 4 0 018 0z"/><circle cx="6" cy="5" r="1.5"/></svg>
                            {item.lokasi}
                          </div>
                        </div>
                      </div>
                    )}
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