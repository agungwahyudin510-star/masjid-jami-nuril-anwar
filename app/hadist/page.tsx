"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Search, BookOpen, X, ChevronDown } from "lucide-react";

// ── Sumber kredibel ──────────────────────────────────────────
const BOOKS = [
  { id: "bukhari",  label: "Shahih Bukhari",  imam: "Imam Al-Bukhari",  color: "#166534" },
  { id: "muslim",   label: "Shahih Muslim",   imam: "Imam Muslim",      color: "#1e3a8a" },
  { id: "abu-daud", label: "Sunan Abu Daud",  imam: "Imam Abu Daud",    color: "#7c2d12" },
  { id: "tirmidzi", label: "Sunan Tirmidzi",  imam: "Imam At-Tirmidzi", color: "#4a1d96" },
  { id: "nasai",    label: "Sunan An-Nasai",  imam: "Imam An-Nasai",    color: "#064e3b" },
  { id: "ibnu-majah", label: "Sunan Ibnu Majah", imam: "Imam Ibnu Majah", color: "#78350f" },
];

// ── Autocomplete topik hukum Islam ───────────────────────────
const TOPICS = [
  "sholat", "puasa", "zakat", "haji", "wudhu", "tayamum",
  "sholat jumat", "sholat berjamaah", "sholat sunnah",
  "nikah", "talak", "waris", "jual beli", "riba",
  "adab makan", "adab tidur", "adab berpakaian",
  "doa", "dzikir", "taubat", "sabar", "syukur",
  "jihad", "amar makruf", "nahi munkar",
  "hukum musik", "hukum gambar", "hukum rokok",
  "hukum riba", "hukum zina", "hukum mencuri",
  "surga", "neraka", "hari kiamat", "malaikat",
  "nabi", "sahabat", "tawasul", "bid'ah",
  "kebersihan", "najis", "halal", "haram",
];

type Hadith = {
  number: number;
  arab: string;
  id: string;
  book: string;
  bookLabel: string;
  imam: string;
  color: string;
};

export default function HadistPage() {
  const [search, setSearch]         = useState("");
  const [results, setResults]       = useState<Hadith[]>([]);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState("");
  const [selectedBook, setSelectedBook] = useState("bukhari");
  const [suggestions, setSuggestions]   = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searched, setSearched]     = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Autocomplete
  useEffect(() => {
    if (search.length < 2) { setSuggestions([]); return; }
    const filtered = TOPICS.filter(t => t.includes(search.toLowerCase())).slice(0, 6);
    setSuggestions(filtered);
    setShowSuggestions(filtered.length > 0);
  }, [search]);

  async function doSearch(query: string) {
    if (!query.trim()) return;
    setLoading(true);
    setError("");
    setResults([]);
    setSearched(true);
    setShowSuggestions(false);

    try {
      const book = BOOKS.find(b => b.id === selectedBook)!;
      // Ambil range lebih besar untuk hasil lebih lengkap
      const res = await fetch(
        `https://api.hadith.gading.dev/books/${selectedBook}?range=1-500`
      );
      if (!res.ok) throw new Error("Gagal fetch");
      const data = await res.json();

      const filtered = data.data.hadiths
        .filter((h: any) =>
          h.id.toLowerCase().includes(query.toLowerCase()) ||
          h.arab.includes(query)
        )
        .slice(0, 20) // max 20 hasil
        .map((h: any) => ({
          ...h,
          book: selectedBook,
          bookLabel: book.label,
          imam: book.imam,
          color: book.color,
        }));

      setResults(filtered);
    } catch {
      setError("Gagal memuat hadist. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  function handleSuggestion(topic: string) {
    setSearch(topic);
    setShowSuggestions(false);
    doSearch(topic);
  }

  const currentBook = BOOKS.find(b => b.id === selectedBook)!;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700&family=Nunito:wght@400;500;600;700;800&family=Amiri:wght@400;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root { --g:#166534; --g2:#15803d; --gold:#d4a732; --gold2:#f0c84e; --ink:#0f1f0f; --bg:#f0faf4; }
        html { -webkit-tap-highlight-color: transparent; }
        body { background: var(--bg); font-family: 'Nunito', sans-serif; color: var(--ink); }

        .hd-header {
          background: linear-gradient(160deg, #78350f, #b45309 50%, #92400e);
          padding: 52px 20px 24px;
          border-radius: 0 0 32px 32px;
          box-shadow: 0 10px 32px rgba(120,53,15,.35);
          position: relative; overflow: hidden;
        }
        .hd-header::before {
          content: ''; position: absolute; inset: 0;
          background: radial-gradient(ellipse 60% 60% at 80% 20%, rgba(212,167,50,.15) 0%, transparent 70%);
          pointer-events: none;
        }
        .back-btn {
          display: inline-flex; align-items: center; gap: 6px;
          color: rgba(255,255,255,.7); text-decoration: none;
          font-size: 13px; font-weight: 700; margin-bottom: 16px;
        }

        /* BOOK SELECTOR */
        .book-scroll {
          display: flex; gap: 8px; overflow-x: auto;
          padding-bottom: 4px; margin-top: 16px;
          scrollbar-width: none;
        }
        .book-scroll::-webkit-scrollbar { display: none; }
        .book-chip {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 7px 14px; border-radius: 20px; flex-shrink: 0;
          font-size: 11px; font-weight: 800; cursor: pointer;
          border: 1px solid rgba(255,255,255,.2);
          font-family: 'Nunito', sans-serif;
          transition: all .2s;
        }
        .book-chip.active { background: rgba(255,255,255,.2); color: #fff; border-color: rgba(255,255,255,.4); }
        .book-chip:not(.active) { background: transparent; color: rgba(255,255,255,.55); }
        .book-chip:active { transform: scale(.95); }

        /* SEARCH BOX */
        .search-wrap {
          position: relative; margin: 20px 0 0;
        }
        .search-box {
          display: flex; align-items: center; gap: 10px;
          background: #fff; border-radius: 16px; padding: 12px 16px;
          border: 1.5px solid rgba(22,101,52,.15);
          box-shadow: 0 4px 16px rgba(0,0,0,.06);
        }
        .search-box:focus-within { border-color: var(--g2); }
        .search-input {
          flex: 1; border: none; outline: none;
          font-family: 'Nunito', sans-serif; font-size: 14px;
          font-weight: 600; color: var(--ink); background: transparent;
        }
        .search-input::placeholder { color: #9ca3af; }
        .search-btn {
          background: linear-gradient(135deg, #b45309, #d97706);
          border: none; border-radius: 12px; padding: 8px 16px;
          color: #fff; font-family: 'Nunito', sans-serif;
          font-size: 12px; font-weight: 800; cursor: pointer;
          transition: all .15s; flex-shrink: 0;
        }
        .search-btn:active { transform: scale(.95); }
        .search-btn:disabled { opacity: .5; }

        /* SUGGESTIONS */
        .suggestions-box {
          position: absolute; top: calc(100% + 6px); left: 0; right: 0;
          background: #fff; border-radius: 16px; z-index: 50;
          border: 1px solid rgba(22,101,52,.12);
          box-shadow: 0 8px 24px rgba(0,0,0,.1);
          overflow: hidden;
        }
        .suggestion-item {
          display: flex; align-items: center; gap: 10px;
          padding: 11px 16px; cursor: pointer;
          border-bottom: 1px solid rgba(0,0,0,.04);
          transition: background .15s;
          font-size: 13px; font-weight: 600; color: var(--ink);
        }
        .suggestion-item:last-child { border-bottom: none; }
        .suggestion-item:active { background: rgba(22,101,52,.06); }

        /* HADITH CARD */
        .hadith-card {
          background: #fff; border-radius: 20px; padding: 20px;
          border: 1px solid rgba(22,101,52,.1);
          box-shadow: 0 3px 14px rgba(0,0,0,.05);
          margin-bottom: 14px;
        }
        .hadith-badge {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 4px 12px; border-radius: 20px;
          font-size: 10px; font-weight: 800;
          text-transform: uppercase; letter-spacing: .8px;
          color: #fff; margin-bottom: 12px;
        }
        .arab-text {
          font-family: 'Amiri', serif;
          font-size: 22px; line-height: 2;
          text-align: right; color: var(--ink);
          direction: rtl; margin-bottom: 14px;
          padding: 14px; background: rgba(22,101,52,.04);
          border-radius: 12px;
          border-right: 3px solid var(--g2);
        }
        .terjemah-text {
          font-size: 14px; line-height: 1.75;
          color: #374151;
        }
        .source-row {
          display: flex; align-items: center; justify-content: space-between;
          margin-top: 14px; padding-top: 12px;
          border-top: 1px solid rgba(0,0,0,.06);
        }

        /* SKELETON */
        .skeleton {
          background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
          background-size: 200% 100%; animation: shimmer 1.5s infinite;
          border-radius: 20px; margin-bottom: 14px;
        }
        @keyframes shimmer { 0%{background-position:200% 0;} 100%{background-position:-200% 0;} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px);} to{opacity:1;transform:translateY(0);} }
        .fade-in { animation: fadeUp .3s ease both; }
      `}</style>

      <main style={{ minHeight: "100vh", paddingBottom: 40 }}>

        {/* HEADER */}
        <div className="hd-header">
          <div style={{ maxWidth: 480, margin: "0 auto", position: "relative", zIndex: 1 }}>
            <Link href="/home" className="back-btn">
              <ArrowLeft size={16} /> Kembali
            </Link>

            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{
                width: 50, height: 50, borderRadius: 16, flexShrink: 0,
                background: "rgba(212,167,50,.2)", border: "1px solid rgba(212,167,50,.4)",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24,
              }}>📜</div>
              <div>
                <h1 style={{ fontFamily: "'Cinzel',serif", fontSize: 20, fontWeight: 700, color: "#fff" }}>
                  Hadist
                </h1>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,.55)", marginTop: 3 }}>
                  6 Kitab Hadist Shahih & Sunan
                </p>
              </div>
            </div>

            {/* BOOK SELECTOR */}
            <div className="book-scroll">
              {BOOKS.map(b => (
                <button
                  key={b.id}
                  className={`book-chip${selectedBook === b.id ? " active" : ""}`}
                  onClick={() => setSelectedBook(b.id)}
                >
                  <BookOpen size={10} />
                  {b.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ maxWidth: 480, margin: "0 auto", padding: "0 16px" }}>

          {/* SEARCH */}
          <div className="search-wrap">
            <div className="search-box">
              <Search size={16} color="#9ca3af" />
              <input
                ref={inputRef}
                className="search-input"
                placeholder="Cari topik... (sholat, puasa, nikah...)"
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") doSearch(search); }}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                autoComplete="off"
              />
              {search && (
                <button onClick={() => { setSearch(""); setResults([]); setSearched(false); }} style={{ background: "none", border: "none", cursor: "pointer", padding: 2 }}>
                  <X size={14} color="#9ca3af" />
                </button>
              )}
              <button className="search-btn" onClick={() => doSearch(search)} disabled={!search.trim() || loading}>
                Cari
              </button>
            </div>

            {/* SUGGESTIONS */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="suggestions-box">
                {suggestions.map(s => (
                  <div key={s} className="suggestion-item" onClick={() => handleSuggestion(s)}>
                    <Search size={12} color="#9ca3af" />
                    <span>{s}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* INFO KITAB */}
          <div style={{
            marginTop: 14, marginBottom: 4,
            background: "rgba(212,167,50,.08)", border: "1px solid rgba(212,167,50,.2)",
            borderRadius: 14, padding: "10px 14px",
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <BookOpen size={14} color="#d4a732" />
            <p style={{ fontSize: 12, color: "#6b7280" }}>
              Mencari di <strong style={{ color: currentBook.color }}>{currentBook.label}</strong> — {currentBook.imam}
            </p>
          </div>

          {/* LOADING */}
          {loading && (
            <div style={{ marginTop: 16 }}>
              {[120, 100, 130].map((h, i) => (
                <div key={i} className="skeleton" style={{ height: h }} />
              ))}
            </div>
          )}

          {/* ERROR */}
          {error && (
            <div style={{ marginTop: 20, textAlign: "center", padding: "20px", background: "#fff", borderRadius: 16 }}>
              <p style={{ fontSize: 32, marginBottom: 8 }}>⚠️</p>
              <p style={{ fontSize: 14, color: "#ef4444" }}>{error}</p>
            </div>
          )}

          {/* EMPTY */}
          {searched && !loading && !error && results.length === 0 && (
            <div style={{ marginTop: 20, textAlign: "center", padding: "40px 20px", background: "#fff", borderRadius: 20 }}>
              <p style={{ fontSize: 32, marginBottom: 8 }}>🔍</p>
              <p style={{ fontSize: 14, fontWeight: 700 }}>Hadist tidak ditemukan</p>
              <p style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>
                Coba kata kunci lain atau ganti kitab
              </p>
            </div>
          )}

          {/* RESULTS */}
          {results.length > 0 && (
            <>
              <p style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "1.5px", color: "var(--g2)", margin: "16px 0 12px" }}>
                ✦ {results.length} Hadist Ditemukan
              </p>
              {results.map((hadith, i) => (
                <div key={i} className="hadith-card fade-in" style={{ animationDelay: `${i * 0.05}s` }}>
                  {/* Badge */}
                  <div className="hadith-badge" style={{ background: hadith.color }}>
                    <BookOpen size={10} />
                    {hadith.bookLabel} — No. {hadith.number}
                  </div>

                  {/* Arab */}
                  <div className="arab-text">{hadith.arab}</div>

                  {/* Terjemahan */}
                  <p className="terjemah-text">{hadith.id}</p>

                  {/* Source */}
                  <div className="source-row">
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: hadith.color }} />
                      <span style={{ fontSize: 11, fontWeight: 700, color: hadith.color }}>{hadith.imam}</span>
                    </div>
                    <span style={{
                      fontSize: 10, fontWeight: 800, padding: "3px 10px",
                      borderRadius: 20, background: "rgba(22,101,52,.08)", color: "var(--g2)",
                    }}>
                      Hadist #{hadith.number}
                    </span>
                  </div>
                </div>
              ))}
            </>
          )}

          {/* EMPTY STATE awal */}
          {!searched && !loading && (
            <div style={{ marginTop: 24 }}>
              <p style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "1.5px", color: "var(--g2)", marginBottom: 12 }}>
                ✦ Topik Populer
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {["sholat", "puasa", "zakat", "nikah", "doa", "adab makan", "taubat", "sabar", "haji", "wudhu"].map(t => (
                  <button
                    key={t}
                    onClick={() => handleSuggestion(t)}
                    style={{
                      background: "#fff", border: "1.5px solid rgba(22,101,52,.15)",
                      borderRadius: 20, padding: "7px 14px",
                      fontSize: 12, fontWeight: 700, color: "var(--g)",
                      cursor: "pointer", fontFamily: "'Nunito',sans-serif",
                      transition: "all .15s",
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {/* Info sumber */}
              <div style={{
                marginTop: 20, background: "#fff",
                border: "1px solid rgba(22,101,52,.1)",
                borderRadius: 16, padding: "16px",
              }}>
                <p style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "1.5px", color: "var(--g2)", marginBottom: 10 }}>
                  ✦ Sumber Referensi
                </p>
                {BOOKS.map(b => (
                  <div key={b.id} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: b.color, flexShrink: 0 }} />
                    <div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "var(--ink)" }}>{b.label}</span>
                      <span style={{ fontSize: 11, color: "#9ca3af" }}> — {b.imam}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </main>
    </>
  );
}