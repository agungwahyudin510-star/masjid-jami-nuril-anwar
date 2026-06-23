"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Search, BookOpen, X, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

type Hadith = {
  number: number;
  arab: string;
  en: string;
  id: string;
  book?: string;
};

const BOOKS = [
  { key: "bukhari",    label: "Shahih Bukhari",   short: "Bukhari",   color: "#2ecc71", border: "rgba(46,204,113,.25)",  bg: "rgba(46,204,113,.1)",  total: 7563 },
  { key: "muslim",     label: "Shahih Muslim",    short: "Muslim",    color: "#3498db", border: "rgba(52,152,219,.25)",  bg: "rgba(52,152,219,.1)",  total: 5362 },
  { key: "abu-dawud",  label: "Sunan Abu Dawud",  short: "Abu Dawud", color: "#9b59b6", border: "rgba(155,89,182,.25)", bg: "rgba(155,89,182,.1)", total: 5274 },
  { key: "tirmidzi",   label: "Sunan Tirmidzi",   short: "Tirmidzi",  color: "#e67e22", border: "rgba(230,126,34,.25)",  bg: "rgba(230,126,34,.1)",  total: 3956 },
  { key: "ibnu-majah", label: "Sunan Ibnu Majah", short: "Ibnu Majah",color: "#c9a84c", border: "rgba(201,168,76,.25)",  bg: "rgba(201,168,76,.1)",  total: 4341 },
  { key: "nasai",      label: "Sunan Nasa'i",     short: "Nasa'i",    color: "#1abc9c", border: "rgba(26,188,156,.25)",  bg: "rgba(26,188,156,.1)",  total: 5758 },
  { key: "ahmad",      label: "Musnad Ahmad",     short: "Ahmad",     color: "#e74c3c", border: "rgba(231,76,60,.25)",   bg: "rgba(231,76,60,.1)",   total: 4305 },
  { key: "malik",      label: "Muwatha Malik",    short: "Malik",     color: "#8e44ad", border: "rgba(142,68,173,.25)",  bg: "rgba(142,68,173,.1)",  total: 1832 },
  { key: "darimi",     label: "Sunan Darimi",     short: "Darimi",    color: "#16a085", border: "rgba(22,160,133,.25)",  bg: "rgba(22,160,133,.1)",  total: 3367 },
];

function getBookMeta(key: string) {
  return BOOKS.find(b => b.key === key) || BOOKS[0];
}

export default function HadistPage() {
  const [hadiths, setHadiths]       = useState<Hadith[]>([]);
  const [loading, setLoading]       = useState(false);
  const [search, setSearch]         = useState("");
  const [searched, setSearched]     = useState(false);
  const [expanded, setExpanded]     = useState<number | null>(null);
  const [showArab, setShowArab]     = useState<Record<number, boolean>>({});
  const [activeBook, setActiveBook] = useState("bukhari");
  const [page, setPage]             = useState(1);
  const [total, setTotal]           = useState(0);
  const [error, setError]           = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const limit = 15;

  async function fetchHadiths(book: string, pg: number) {
    setLoading(true); setError(""); setExpanded(null); setShowArab({});
    try {
      const res = await fetch(`/api/hadist?book=${book}&page=${pg}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setHadiths(data.hadiths || []);
      setTotal(data.total || 0);
    } catch (e) {
      setError("Gagal memuat hadist. Coba lagi.");
      setHadiths([]);
    } finally {
      setLoading(false);
    }
  }

  async function doSearch(q: string) {
    if (!q.trim()) return;
    setLoading(true); setSearched(true); setError(""); setExpanded(null);
    try {
      const res = await fetch(`/api/hadist?q=${encodeURIComponent(q)}&book=${activeBook}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setHadiths(data.hadiths || []);
      setTotal(data.total || 0);
    } catch {
      setError("Gagal mencari hadist.");
      setHadiths([]);
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setSearch(""); setSearched(false); setExpanded(null); setPage(1);
    fetchHadiths(activeBook, 1);
  }

  function selectBook(book: string) {
    setActiveBook(book); setPage(1); setSearched(false); setSearch("");
    fetchHadiths(book, 1);
  }

  function nextPage() {
    const np = page + 1; setPage(np);
    fetchHadiths(activeBook, np);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function prevPage() {
    if (page <= 1) return;
    const np = page - 1; setPage(np);
    fetchHadiths(activeBook, np);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function toggleArab(i: number) {
    setShowArab(prev => ({ ...prev, [i]: !prev[i] }));
  }

  useEffect(() => { fetchHadiths("bukhari", 1); }, []);

  const totalPages = Math.ceil(total / limit);
  const bookMeta = getBookMeta(activeBook);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Playfair+Display:wght@600;700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        html{-webkit-tap-highlight-color:transparent;}
        body{background:var(--msj-bg);font-family:'Plus Jakarta Sans',sans-serif;color:var(--msj-text-body);}
        .bg-base{position:fixed;inset:0;background:var(--msj-bg-gradient);z-index:0;}
        .bg-pat{position:fixed;inset:0;opacity:var(--msj-pattern-opacity);z-index:0;
          background-image:url("data:image/svg+xml,%3Csvg width='120' height='120' viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23c9a84c' stroke-width='0.6'%3E%3Cpolygon points='60,6 114,33 114,87 60,114 6,87 6,33'/%3E%3Cpolygon points='60,22 98,42 98,78 60,98 22,78 22,42'/%3E%3C/g%3E%3C/svg%3E");
          background-size:120px 120px;}
        .bar{position:fixed;left:0;right:0;height:2px;z-index:10;background:var(--msj-bar);}
        .bar-t{top:0;}.bar-b{bottom:0;}
        .hd-root{position:relative;z-index:1;min-height:100vh;padding-bottom:48px;}
        .wrap{max-width:480px;margin:0 auto;}
        @keyframes fadeDown{from{opacity:0;transform:translateY(-14px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}

        .hd-header{background:var(--msj-hadist-header-bg);border-radius:0 0 28px 28px;padding:56px 20px 24px;position:relative;overflow:hidden;border-bottom:1px solid var(--msj-gold-border);box-shadow:var(--msj-card-shadow);animation:fadeDown .6s cubic-bezier(.22,1,.36,1) both;}
        .hd-header::before{content:'';position:absolute;inset:0;pointer-events:none;background:radial-gradient(ellipse 60% 60% at 80% 20%,var(--msj-gold-bg) 0%,transparent 70%);}
        .hd-ring{position:absolute;top:-50px;right:-50px;width:200px;height:200px;border-radius:50%;border:1px solid var(--msj-gold-border);pointer-events:none;}
        .back-btn{display:inline-flex;align-items:center;gap:6px;color:var(--msj-gold-text);text-decoration:none;font-size:13px;font-weight:600;margin-bottom:16px;transition:color .2s;}
        .back-btn:hover{color:var(--msj-gold-bright);}
        .hd-title{font-family:'Playfair Display',serif;font-size:22px;font-weight:700;color:var(--msj-text-title);}
        .hd-sub{font-size:11px;color:var(--msj-text-sub);margin-top:3px;}

        .search-wrap{margin:16px 20px 0;}
        .search-box{display:flex;align-items:center;gap:10px;background:var(--msj-input-bg);border:1px solid var(--msj-input-border);border-radius:14px;padding:12px 14px;transition:border-color .2s;}
        .search-box:focus-within{border-color:var(--msj-input-focus);}
        .search-input{flex:1;border:none;outline:none;font-family:'Plus Jakarta Sans',sans-serif;font-size:14px;color:var(--msj-input-text);background:transparent;}
        .search-input::placeholder{color:var(--msj-input-placeholder);}
        .search-btn{background:var(--msj-search-btn-bg);border:1px solid var(--msj-gold-border);border-radius:10px;padding:8px 16px;color:var(--msj-text-title);font-family:'Plus Jakarta Sans',sans-serif;font-size:12px;font-weight:600;cursor:pointer;flex-shrink:0;transition:all .2s;}
        .search-btn:disabled{opacity:.45;cursor:not-allowed;}
        .clear-btn{background:none;border:none;cursor:pointer;padding:2px;color:var(--msj-text-muted);line-height:0;}

        .books-scroll{display:flex;gap:8px;padding:0 20px;overflow-x:auto;scrollbar-width:none;margin-top:14px;}
        .books-scroll::-webkit-scrollbar{display:none;}
        .book-btn{flex-shrink:0;padding:7px 14px;border-radius:20px;border:1px solid var(--msj-card-border);background:var(--msj-card-bg);font-family:'Plus Jakarta Sans',sans-serif;font-size:11px;font-weight:600;color:var(--msj-text-sub);cursor:pointer;transition:all .15s;white-space:nowrap;}

        .sec-head{display:flex;align-items:center;gap:10px;padding:0 20px;margin:16px 0 12px;}
        .sec-line{flex:1;height:1px;}
        .sl{background:var(--msj-divider-line-l);}
        .sr{background:var(--msj-divider-line-r);}
        .sec-text{font-size:9px;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;color:var(--msj-divider-text);white-space:nowrap;}

        .hadith-cards{display:flex;flex-direction:column;gap:12px;padding:0 20px;}
        .hadith-card{background:var(--msj-card-bg);border-radius:18px;padding:18px;position:relative;overflow:hidden;border:1px solid;animation:fadeUp .4s ease both;}
        .h-badge{display:inline-flex;align-items:center;gap:5px;padding:4px 12px;border-radius:20px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.8px;margin-bottom:12px;}
        .arab-text{font-family:'Amiri',serif;font-size:20px;line-height:2.1;text-align:right;direction:rtl;color:var(--msj-text-title);padding:12px;border-radius:10px;margin-bottom:10px;border-right:3px solid;background:var(--msj-card-bg);}
        .terjemah{font-size:13px;line-height:1.75;color:var(--msj-text-desc);cursor:pointer;}
        .terjemah.collapsed{display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;}
        .expand-btn{font-size:11px;font-weight:600;margin-top:8px;cursor:pointer;display:inline-block;}
        .arab-toggle{font-size:10px;font-weight:600;padding:4px 10px;border-radius:8px;border:1px solid;cursor:pointer;margin-top:8px;display:inline-flex;align-items:center;gap:4px;font-family:'Plus Jakarta Sans',sans-serif;}
        .h-footer{display:flex;align-items:center;justify-content:space-between;margin-top:10px;padding-top:10px;border-top:1px solid var(--msj-card-border);}
        .h-source{display:flex;align-items:center;gap:6px;}
        .h-num{font-size:10px;font-weight:700;padding:3px 10px;border-radius:20px;background:var(--msj-card-bg);color:var(--msj-text-muted);}

        .loading-box{display:flex;flex-direction:column;align-items:center;gap:12px;padding:60px 20px;margin:0 20px;background:var(--msj-card-bg);border-radius:18px;border:1px solid var(--msj-card-border);}
        .spin{animation:spin 1s linear infinite;}
        .empty-box{margin:0 20px;background:var(--msj-card-bg);border:1px solid var(--msj-card-border);border-radius:18px;padding:40px 20px;text-align:center;}
        .error-box{margin:0 20px;background:rgba(231,76,60,.08);border:1px solid rgba(231,76,60,.25);border-radius:18px;padding:20px;text-align:center;font-size:13px;color:#e74c3c;}

        .pagination{display:flex;align-items:center;justify-content:center;gap:12px;padding:0 20px;margin-top:16px;}
        .page-btn{display:flex;align-items:center;gap:4px;padding:8px 16px;border-radius:10px;border:1px solid var(--msj-card-border);background:var(--msj-card-bg);font-family:'Plus Jakarta Sans',sans-serif;font-size:12px;font-weight:600;color:var(--msj-text-sub);cursor:pointer;transition:all .2s;}
        .page-btn:disabled{opacity:.4;cursor:not-allowed;}
        .page-btn:not(:disabled):hover{border-color:var(--msj-gold-border);color:var(--msj-gold-text);}
        .page-info{font-size:12px;font-weight:600;color:var(--msj-text-muted);white-space:nowrap;}

        .translate-note{font-size:10px;color:var(--msj-text-muted);text-align:center;padding:8px 20px;opacity:.7;}

        :root{
          --msj-hadist-header-bg:linear-gradient(160deg,#2a1a00 0%,#5c3a00 40%,#3d2500 100%);
          --msj-search-btn-bg:linear-gradient(135deg,#5c3a00,#8a5a00);
        }
        html:not(.dark){
          --msj-hadist-header-bg:linear-gradient(160deg,#f5e9d0 0%,#e8d5a8 40%,#eedfc0 100%);
          --msj-search-btn-bg:linear-gradient(135deg,rgba(201,168,76,.2),rgba(180,140,40,.15));
        }
      `}</style>

      <div className="bg-base"/><div className="bg-pat"/>
      <div className="bar bar-t"/><div className="bar bar-b"/>

      <div className="hd-root">
        <div className="hd-header">
          <div className="hd-ring"/>
          <div className="wrap" style={{position:"relative",zIndex:1}}>
            <Link href="/home" className="back-btn"><ArrowLeft size={15}/> Kembali</Link>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <div style={{width:48,height:48,borderRadius:14,flexShrink:0,background:"var(--msj-gold-bg)",border:"1px solid var(--msj-gold-border)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>📜</div>
              <div>
                <div className="hd-title">Hadist</div>
                <div className="hd-sub">9 Kitab · {total.toLocaleString()} Hadist · Terjemahan AI</div>
              </div>
            </div>
          </div>
        </div>

        <div className="wrap">
          {/* Search */}
          <div className="search-wrap">
            <div className="search-box">
              <Search size={15} color="var(--msj-gold-text)"/>
              <input
                ref={inputRef}
                className="search-input"
                placeholder="Cari hadist dalam bahasa Indonesia..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") doSearch(search); }}
                autoComplete="off"
              />
              {(search || searched) && (
                <button className="clear-btn" onClick={reset}><X size={14}/></button>
              )}
              <button className="search-btn" onClick={() => doSearch(search)} disabled={!search.trim() || loading}>
                Cari
              </button>
            </div>
          </div>

          {/* Pilih Kitab */}
          {!searched && (
            <div className="books-scroll">
              {BOOKS.map(b => (
                <button key={b.key} className="book-btn"
                  style={activeBook===b.key ? {background:b.bg,borderColor:b.color,color:b.color} : {}}
                  onClick={() => selectBook(b.key)}>
                  {b.short}
                </button>
              ))}
            </div>
          )}

          {/* Section header */}
          <div className="sec-head">
            <div className="sec-line sl"/>
            <span className="sec-text">
              {searched ? `✦ ${hadiths.length} Hasil Pencarian ✦` : `✦ ${bookMeta.label} ✦`}
            </span>
            <div className="sec-line sr"/>
          </div>

          {/* Loading */}
          {loading && (
            <div className="loading-box">
              <Loader2 size={28} color="var(--msj-gold-text)" className="spin"/>
              <p style={{fontSize:13,color:"var(--msj-text-sub)"}}>Memuat & menerjemahkan hadist...</p>
              <p style={{fontSize:11,color:"var(--msj-text-muted)"}}>Proses ini mungkin butuh beberapa detik</p>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="error-box">{error}</div>
          )}

          {/* Empty */}
          {!loading && !error && hadiths.length === 0 && (
            <div className="empty-box">
              <div style={{fontSize:36,opacity:.3,marginBottom:12}}>🔍</div>
              <p style={{fontSize:14,fontWeight:600,color:"var(--msj-text-sub)"}}>Hadist tidak ditemukan</p>
              <p style={{fontSize:12,color:"var(--msj-text-muted)",marginTop:4}}>Coba kata kunci lain</p>
            </div>
          )}

          {/* Hadist cards */}
          {!loading && hadiths.length > 0 && (
            <>
              <div className="hadith-cards">
                {hadiths.map((h, i) => {
                  const bk = getBookMeta(h.book || activeBook);
                  return (
                    <div key={i} className="hadith-card"
                      style={{borderColor:bk.border, animationDelay:`${i*0.03}s`}}>
                      <div style={{position:"absolute",top:0,left:0,right:0,height:1,background:`linear-gradient(90deg,transparent,${bk.color}40,transparent)`}}/>
                      <div className="h-badge" style={{background:bk.bg,color:bk.color,border:`1px solid ${bk.border}`}}>
                        <BookOpen size={9}/> {bk.label}
                      </div>

                      {/* Arab text jika ada */}
                      {h.arab && showArab[i] && (
                        <div className="arab-text" style={{borderRightColor:bk.color}}>{h.arab}</div>
                      )}

                      {/* Terjemahan Indonesia */}
                      <p className={`terjemah ${expanded===i?"":"collapsed"}`} onClick={() => setExpanded(expanded===i?null:i)}>
                        {h.id}
                      </p>
                      <span className="expand-btn" style={{color:bk.color}} onClick={() => setExpanded(expanded===i?null:i)}>
                        {expanded===i?"▲ Sembunyikan":"▼ Baca selengkapnya"}
                      </span>

                      {/* Tombol lihat Arab */}
                      {h.arab && (
                        <div>
                          <button className="arab-toggle"
                            style={{borderColor:bk.border,color:bk.color,background:bk.bg}}
                            onClick={() => toggleArab(i)}>
                            {showArab[i] ? "Sembunyikan Arab" : "Lihat Arab"}
                          </button>
                        </div>
                      )}

                      <div className="h-footer">
                        <div className="h-source">
                          <div style={{width:6,height:6,borderRadius:"50%",background:bk.color,flexShrink:0}}/>
                          <span style={{fontSize:11,fontWeight:700,color:bk.color}}>{bk.label}</span>
                        </div>
                        <span className="h-num">No. {h.number}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="translate-note">✦ Terjemahan dibantu AI — selalu merujuk ke kitab asli ✦</p>
            </>
          )}

          {/* Pagination */}
          {!loading && !searched && totalPages > 1 && (
            <div className="pagination">
              <button className="page-btn" onClick={prevPage} disabled={page<=1}>
                <ChevronLeft size={14}/> Prev
              </button>
              <span className="page-info">Hal {page} / {totalPages} · {total.toLocaleString()} hadist</span>
              <button className="page-btn" onClick={nextPage} disabled={page>=totalPages}>
                Next <ChevronRight size={14}/>
              </button>
            </div>
          )}

          <div style={{height:32}}/>
        </div>
      </div>
    </>
  );
}