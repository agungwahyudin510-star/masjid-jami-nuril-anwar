"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Search, BookOpen, X } from "lucide-react";

const BOOKS = [
  { id: "bukhari",    label: "Shahih Bukhari",   color: "#2ecc71", border: "rgba(46,204,113,.25)",  bg: "rgba(46,204,113,.1)",  kategori: "Kutubussittah" },
  { id: "muslim",     label: "Shahih Muslim",    color: "#3498db", border: "rgba(52,152,219,.25)",  bg: "rgba(52,152,219,.1)",  kategori: "Kutubussittah" },
  { id: "abu-daud",   label: "Sunan Abu Daud",   color: "#e67e22", border: "rgba(230,126,34,.25)",  bg: "rgba(230,126,34,.1)",  kategori: "Kutubussittah" },
  { id: "tirmidzi",   label: "Sunan Tirmidzi",   color: "#9b59b6", border: "rgba(155,89,182,.25)",  bg: "rgba(155,89,182,.1)",  kategori: "Kutubussittah" },
  { id: "nasai",      label: "Sunan An-Nasai",   color: "#1abc9c", border: "rgba(26,188,156,.25)",  bg: "rgba(26,188,156,.1)",  kategori: "Kutubussittah" },
  { id: "ibnu-majah", label: "Sunan Ibnu Majah", color: "#c9a84c", border: "rgba(201,168,76,.25)",  bg: "rgba(201,168,76,.1)",  kategori: "Kutubussittah" },
  { id: "ahmad",      label: "Musnad Ahmad",     color: "#e74c3c", border: "rgba(231,76,60,.25)",   bg: "rgba(231,76,60,.1)",   kategori: "Musnad" },
  { id: "malik",      label: "Muwatha Malik",    color: "#27ae60", border: "rgba(39,174,96,.25)",   bg: "rgba(39,174,96,.1)",   kategori: "Muwatha" },
  { id: "darimi",     label: "Sunan Ad-Darimi",  color: "#8e44ad", border: "rgba(142,68,173,.25)",  bg: "rgba(142,68,173,.1)",  kategori: "Sunan" },
];

const TOPICS = [
  "sholat","puasa","zakat","haji","wudhu","tayamum",
  "sholat jumat","sholat berjamaah","sholat sunnah",
  "nikah","talak","waris","jual beli","riba",
  "adab makan","adab tidur","adab berpakaian",
  "doa","dzikir","taubat","sabar","syukur",
  "jihad","amar makruf","nahi munkar",
  "hukum musik","hukum gambar","hukum rokok",
  "surga","neraka","hari kiamat","malaikat",
  "kebersihan","najis","halal","haram",
  "sunnah","bidah","tauhid","syirik",
  "sedekah","infaq","wakaf","amanah",
];

type Hadith = { number: number; arab: string; id: string; book: string; bookLabel: string; color: string; border: string; bg: string; };

export default function HadistPage() {
  const [search, setSearch]           = useState("");
  const [results, setResults]         = useState<Hadith[]>([]);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSug, setShowSug]         = useState(false);
  const [searched, setSearched]       = useState(false);
  const [expanded, setExpanded]       = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (search.length < 2) { setSuggestions([]); setShowSug(false); return; }
    const filtered = TOPICS.filter(t => t.includes(search.toLowerCase())).slice(0, 6);
    setSuggestions(filtered);
    setShowSug(filtered.length > 0);
  }, [search]);

  async function doSearch(query: string) {
    if (!query.trim()) return;
    setLoading(true); setError(""); setResults([]); setSearched(true); setShowSug(false); setExpanded(null);
    try {
      const allResults: Hadith[] = [];
      for (const book of BOOKS) {
        try {
          const res = await fetch(`https://api.hadith.gading.dev/books/${book.id}?range=1-300`);
          if (!res.ok) continue;
          const data = await res.json();
          if (!data?.data?.hadiths) continue;
          const filtered = data.data.hadiths
            .filter((h: any) => h.id?.toLowerCase().includes(query.toLowerCase()))
            .slice(0, 5)
            .map((h: any) => ({
              number: h.number, arab: h.arab, id: h.id,
              book: book.id, bookLabel: book.label,
              color: book.color, border: book.border, bg: book.bg,
            }));
          allResults.push(...filtered);
        } catch { continue; }
      }
      setResults(allResults.slice(0, 30));
    } catch { setError("Gagal memuat hadist. Coba lagi."); }
    finally { setLoading(false); }
  }

  function handleSug(topic: string) { setSearch(topic); setShowSug(false); doSearch(topic); }

  const popularTopics = ["sholat","puasa","zakat","nikah","doa","adab makan","taubat","sabar","haji","wudhu","tauhid","sedekah"];
  const kategoriList = ["Kutubussittah","Musnad","Muwatha","Sunan"];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Playfair+Display:wght@600;700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        html{-webkit-tap-highlight-color:transparent;}
        body{background:#060f09;font-family:'Plus Jakarta Sans',sans-serif;color:#fff;}

        .bg-base{position:fixed;inset:0;background:radial-gradient(ellipse 100% 55% at 50% 0%,#0d2e18 0%,#060f09 60%);z-index:0;}
        .bg-pat{position:fixed;inset:0;opacity:.035;z-index:0;background-image:url("data:image/svg+xml,%3Csvg width='120' height='120' viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23c9a84c' stroke-width='0.6'%3E%3Cpolygon points='60,6 114,33 114,87 60,114 6,87 6,33'/%3E%3Cpolygon points='60,22 98,42 98,78 60,98 22,78 22,42'/%3E%3C/g%3E%3C/svg%3E");background-size:120px 120px;}
        .bar{position:fixed;left:0;right:0;height:2px;z-index:10;background:linear-gradient(90deg,transparent,#b8962e 20%,#f0d080 50%,#b8962e 80%,transparent);}
        .bar-t{top:0;}.bar-b{bottom:0;}

        .hd-root{position:relative;z-index:1;min-height:100vh;padding-bottom:48px;}
        .wrap{max-width:480px;margin:0 auto;}

        @keyframes fadeDown{from{opacity:0;transform:translateY(-14px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
        @keyframes spin{to{transform:rotate(360deg)}}

        /* Header */
        .hd-header{
          background:linear-gradient(160deg,#2a1a00 0%,#5c3a00 40%,#3d2500 100%);
          border-radius:0 0 28px 28px;padding:56px 20px 24px;
          position:relative;overflow:hidden;
          border-bottom:1px solid rgba(201,168,76,.2);
          box-shadow:0 12px 40px rgba(0,0,0,.5);
          animation:fadeDown .6s cubic-bezier(.22,1,.36,1) both;
        }
        .hd-header::before{content:'';position:absolute;inset:0;pointer-events:none;background:radial-gradient(ellipse 60% 60% at 80% 20%,rgba(201,168,76,.1) 0%,transparent 70%);}
        .hd-ring{position:absolute;top:-50px;right:-50px;width:200px;height:200px;border-radius:50%;border:1px solid rgba(201,168,76,.1);box-shadow:0 0 0 28px rgba(201,168,76,.04);pointer-events:none;}

        .back-btn{display:inline-flex;align-items:center;gap:6px;color:rgba(201,168,76,.7);text-decoration:none;font-size:13px;font-weight:600;margin-bottom:16px;transition:color .2s;}
        .back-btn:hover{color:rgba(201,168,76,.9);}
        .hd-title{font-family:'Playfair Display',serif;font-size:22px;font-weight:700;color:#e8d8a0;}
        .hd-sub{font-size:11px;color:rgba(255,255,255,.35);margin-top:3px;}

        /* Search */
        .search-wrap{position:relative;margin:20px 20px 0;}
        .search-box{
          display:flex;align-items:center;gap:10px;
          background:rgba(255,255,255,.06);
          border:1px solid rgba(201,168,76,.2);
          border-radius:14px;padding:12px 14px;
          transition:border-color .2s;
        }
        .search-box:focus-within{border-color:rgba(201,168,76,.45);background:rgba(255,255,255,.08);}
        .search-input{flex:1;border:none;outline:none;font-family:'Plus Jakarta Sans',sans-serif;font-size:14px;font-weight:500;color:#fff;background:transparent;}
        .search-input::placeholder{color:rgba(255,255,255,.2);}
        .search-btn{
          background:linear-gradient(135deg,#5c3a00,#8a5a00);
          border:1px solid rgba(201,168,76,.3);border-radius:10px;
          padding:8px 16px;color:#e8d8a0;font-family:'Plus Jakarta Sans',sans-serif;
          font-size:12px;font-weight:600;cursor:pointer;flex-shrink:0;transition:all .2s;
        }
        .search-btn:hover{border-color:rgba(201,168,76,.5);}
        .search-btn:disabled{opacity:.4;cursor:not-allowed;}
        .clear-btn{background:none;border:none;cursor:pointer;padding:2px;color:rgba(255,255,255,.3);line-height:0;}

        /* Suggestions */
        .sug-box{
          position:absolute;top:calc(100% + 6px);left:0;right:0;
          background:#0d1f13;border:1px solid rgba(201,168,76,.15);
          border-radius:14px;z-index:50;overflow:hidden;
          box-shadow:0 8px 24px rgba(0,0,0,.4);
        }
        .sug-item{display:flex;align-items:center;gap:10px;padding:11px 14px;cursor:pointer;border-bottom:1px solid rgba(255,255,255,.05);font-size:13px;color:rgba(255,255,255,.7);transition:background .15s;}
        .sug-item:last-child{border-bottom:none;}
        .sug-item:hover{background:rgba(201,168,76,.07);}

        /* Section */
        .sec-head{display:flex;align-items:center;gap:10px;padding:0 20px;margin:20px 0 12px;}
        .sec-line{flex:1;height:1px;}.sl{background:linear-gradient(90deg,transparent,rgba(201,168,76,.22));}.sr{background:linear-gradient(90deg,rgba(201,168,76,.22),transparent);}
        .sec-text{font-size:9px;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;color:rgba(201,168,76,.45);white-space:nowrap;}

        /* Topic chips */
        .chips{display:flex;flex-wrap:wrap;gap:8px;padding:0 20px;}
        .chip{background:rgba(255,255,255,.04);border:1px solid rgba(201,168,76,.14);border-radius:20px;padding:7px 14px;font-size:12px;font-weight:600;color:rgba(201,168,76,.7);cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;transition:all .15s;}
        .chip:hover{background:rgba(201,168,76,.08);border-color:rgba(201,168,76,.3);}

        /* Kitab list */
        .kitab-card{margin:0 20px;background:rgba(255,255,255,.03);border:1px solid rgba(201,168,76,.1);border-radius:16px;padding:16px;}
        .kitab-row{display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid rgba(255,255,255,.04);}
        .kitab-row:last-child{border-bottom:none;}
        .kitab-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0;}
        .kitab-nama{font-size:13px;font-weight:600;color:rgba(255,255,255,.7);}
        .kitab-badge{margin-left:auto;font-size:9px;font-weight:700;padding:2px 8px;border-radius:10px;letter-spacing:.5px;}

        /* Hadith card */
        .hadith-cards{display:flex;flex-direction:column;gap:12px;padding:0 20px;}
        .hadith-card{background:rgba(255,255,255,.03);border-radius:18px;padding:18px;position:relative;overflow:hidden;border:1px solid;animation:fadeUp .4s ease both;cursor:pointer;}
        .hadith-card::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;}
        .h-badge{display:inline-flex;align-items:center;gap:5px;padding:4px 12px;border-radius:20px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.8px;margin-bottom:12px;}
        .arab-text{font-family:'Amiri',serif;font-size:20px;line-height:2;text-align:right;direction:rtl;color:#e8d8a0;padding:14px;border-radius:12px;margin-bottom:12px;border-right:3px solid;}
        .terjemah{font-size:13px;line-height:1.75;color:rgba(255,255,255,.55);}
        .terjemah.collapsed{display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;}
        .expand-btn{font-size:11px;font-weight:600;margin-top:8px;cursor:pointer;display:inline-block;}
        .h-footer{display:flex;align-items:center;justify-content:space-between;margin-top:12px;padding-top:10px;border-top:1px solid rgba(255,255,255,.06);}
        .h-source{display:flex;align-items:center;gap:6px;}
        .h-num{font-size:10px;font-weight:700;padding:3px 10px;border-radius:20px;background:rgba(255,255,255,.06);color:rgba(255,255,255,.4);}

        /* Loading */
        .skeleton{border-radius:18px;margin-bottom:12px;overflow:hidden;}
        .skel-inner{background:linear-gradient(90deg,rgba(255,255,255,.04) 25%,rgba(255,255,255,.08) 50%,rgba(255,255,255,.04) 75%);background-size:200% 100%;animation:shimmer 1.5s infinite;}
        .spinner{width:22px;height:22px;border:2px solid rgba(201,168,76,.15);border-top-color:#c9a84c;border-radius:50%;animation:spin .7s linear infinite;margin:0 auto 12px;}

        /* Empty */
        .empty-box{margin:0 20px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:18px;padding:40px 20px;text-align:center;}
        .empty-icon{font-size:36px;opacity:.3;margin-bottom:12px;}

        /* Error */
        .error-box{margin:0 20px;background:rgba(231,76,60,.08);border:1px solid rgba(231,76,60,.2);border-radius:16px;padding:20px;text-align:center;}
      `}</style>

      <div className="bg-base"/><div className="bg-pat"/>
      <div className="bar bar-t"/><div className="bar bar-b"/>

      <div className="hd-root">

        {/* Header */}
        <div className="hd-header">
          <div className="hd-ring"/>
          <div className="wrap" style={{position:"relative",zIndex:1}}>
            <Link href="/home" className="back-btn">
              <ArrowLeft size={15}/> Kembali
            </Link>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <div style={{width:48,height:48,borderRadius:14,flexShrink:0,background:"rgba(201,168,76,.12)",border:"1px solid rgba(201,168,76,.25)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>📜</div>
              <div>
                <div className="hd-title">Hadist</div>
                <div className="hd-sub">9 Kitab Hadist — Kutubussittah & Musnad</div>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="search-wrap">
          <div className="search-box">
            <Search size={15} color="rgba(201,168,76,0.5)"/>
            <input
              ref={inputRef}
              className="search-input"
              placeholder="Cari topik... (sholat, puasa, nikah...)"
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") doSearch(search); }}
              onFocus={() => suggestions.length > 0 && setShowSug(true)}
              autoComplete="off"
            />
            {search && (
              <button className="clear-btn" onClick={() => { setSearch(""); setResults([]); setSearched(false); setSuggestions([]); }}>
                <X size={14}/>
              </button>
            )}
            <button className="search-btn" onClick={() => doSearch(search)} disabled={!search.trim() || loading}>
              {loading ? "..." : "Cari"}
            </button>
          </div>

          {showSug && suggestions.length > 0 && (
            <div className="sug-box">
              {suggestions.map(s => (
                <div key={s} className="sug-item" onClick={() => handleSug(s)}>
                  <Search size={11} color="rgba(201,168,76,0.4)"/>
                  <span>{s}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div style={{padding:"16px 20px 0"}}>
            {[140,110,130].map((h,i) => (
              <div key={i} className="skeleton" style={{height:h,marginBottom:12}}>
                <div className="skel-inner" style={{height:"100%"}}/>
              </div>
            ))}
            <div style={{textAlign:"center",paddingTop:8}}>
              <div className="spinner"/>
              <p style={{fontSize:12,color:"rgba(255,255,255,.25)"}}>Mencari di 9 kitab hadist...</p>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="error-box" style={{marginTop:16}}>
            <p style={{fontSize:28,marginBottom:8}}>⚠️</p>
            <p style={{fontSize:13,color:"#e74c3c"}}>{error}</p>
          </div>
        )}

        {/* Empty result */}
        {searched && !loading && !error && results.length === 0 && (
          <div className="empty-box" style={{marginTop:16}}>
            <div className="empty-icon">🔍</div>
            <p style={{fontSize:14,fontWeight:600,color:"rgba(255,255,255,.5)"}}>Hadist tidak ditemukan</p>
            <p style={{fontSize:12,color:"rgba(255,255,255,.25)",marginTop:4}}>Coba kata kunci lain</p>
          </div>
        )}

        {/* Results */}
        {results.length > 0 && (
          <>
            <div className="sec-head">
              <div className="sec-line sl"/>
              <span className="sec-text">✦ {results.length} Hadist Ditemukan ✦</span>
              <div className="sec-line sr"/>
            </div>
            <div className="hadith-cards">
              {results.map((h, i) => (
                <div key={i} className="hadith-card"
                  style={{borderColor:h.border,animationDelay:`${i*0.04}s`}}
                  onClick={() => setExpanded(expanded===i?null:i)}>
                  <div className="hadith-card" style={{position:"absolute",top:0,left:0,right:0,height:1,background:`linear-gradient(90deg,transparent,${h.color}40,transparent)`,border:"none",padding:0,borderRadius:0}}/>
                  <div className="h-badge" style={{background:h.bg,color:h.color,border:`1px solid ${h.border}`}}>
                    <BookOpen size={9}/> {h.bookLabel} — No. {h.number}
                  </div>
                  <div className="arab-text" style={{background:`${h.bg}`,borderRightColor:h.color}}>
                    {h.arab}
                  </div>
                  <p className={`terjemah ${expanded===i?"":"collapsed"}`}>{h.id}</p>
                  <span className="expand-btn" style={{color:h.color}}>
                    {expanded===i?"▲ Sembunyikan":"▼ Baca selengkapnya"}
                  </span>
                  <div className="h-footer">
                    <div className="h-source">
                      <div style={{width:6,height:6,borderRadius:"50%",background:h.color,flexShrink:0}}/>
                      <span style={{fontSize:11,fontWeight:700,color:h.color}}>{h.bookLabel}</span>
                    </div>
                    <span className="h-num">Hadist #{h.number}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Default state */}
        {!searched && !loading && (
          <>
            <div className="sec-head">
              <div className="sec-line sl"/><span className="sec-text">✦ Topik Populer ✦</span><div className="sec-line sr"/>
            </div>
            <div className="chips">
              {popularTopics.map(t => (
                <button key={t} className="chip" onClick={() => handleSug(t)}>{t}</button>
              ))}
            </div>

            <div className="sec-head" style={{marginTop:20}}>
              <div className="sec-line sl"/><span className="sec-text">✦ Kitab Tersedia ✦</span><div className="sec-line sr"/>
            </div>
            <div className="kitab-card">
              {kategoriList.map(kat => {
                const kitabs = BOOKS.filter(b => b.kategori === kat);
                if (!kitabs.length) return null;
                return (
                  <div key={kat} style={{marginBottom:14}}>
                    <p style={{fontSize:9,fontWeight:700,color:"rgba(201,168,76,.4)",textTransform:"uppercase",letterSpacing:"2px",marginBottom:8}}>{kat}</p>
                    {kitabs.map(b => (
                      <div key={b.id} className="kitab-row">
                        <div className="kitab-dot" style={{background:b.color}}/>
                        <span className="kitab-nama">{b.label}</span>
                        <span className="kitab-badge" style={{background:b.bg,color:b.color,border:`1px solid ${b.border}`}}>{b.kategori}</span>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </>
        )}

        <div style={{height:24}}/>
      </div>
    </>
  );
}