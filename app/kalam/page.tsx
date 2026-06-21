"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Search, BookOpen, X, Feather, Scroll, Sparkles, Loader2, ExternalLink } from "lucide-react";

type Hikmah = {
  id: number;
  arab?: string;
  quote: string;
  author: string;
  authorDetail: string;
  source?: string;
  category: string;
  color: string;
  border: string;
  bg: string;
  tags: string[];
};

type Referensi = {
  judul: string;
  penulis: string;
  keterangan: string;
};

const HIKMAH_DATA: Hikmah[] = [
  // RUMI
  { id:1, arab:"بشنو این نی چون شکایت می‌کند", quote:"Dengarkanlah seruling ini, ia mengisahkan perpisahan. Ia mengeluh karena terputus dari asal-usulnya.", author:"Jalaluddin Rumi", authorDetail:"Penyair Sufi, Persia (1207–1273)", source:"Masnawi", category:"Cinta & Kerinduan", color:"#c9a84c", border:"rgba(201,168,76,.3)", bg:"rgba(201,168,76,.08)", tags:["rumi","cinta","kerinduan","sufi","masnawi"] },
  { id:2, quote:"Kamu bukan setetes air dalam lautan. Kamu adalah seluruh lautan dalam setetes air.", author:"Jalaluddin Rumi", authorDetail:"Penyair Sufi, Persia (1207–1273)", source:"Diwan-e Shams-e Tabrizi", category:"Jiwa & Makrifat", color:"#c9a84c", border:"rgba(201,168,76,.3)", bg:"rgba(201,168,76,.08)", tags:["rumi","jiwa","makrifat","sufi"] },
  { id:3, quote:"Luka adalah tempat cahaya masuk ke dalam dirimu.", author:"Jalaluddin Rumi", authorDetail:"Penyair Sufi, Persia (1207–1273)", source:"Masnawi", category:"Sabar & Ujian", color:"#c9a84c", border:"rgba(201,168,76,.3)", bg:"rgba(201,168,76,.08)", tags:["rumi","sabar","ujian","cahaya"] },
  { id:4, quote:"Diamlah dan biarkan bahasa hati yang berbicara.", author:"Jalaluddin Rumi", authorDetail:"Penyair Sufi, Persia (1207–1273)", source:"Fihi Ma Fihi", category:"Hati & Batin", color:"#c9a84c", border:"rgba(201,168,76,.3)", bg:"rgba(201,168,76,.08)", tags:["rumi","hati","diam","batin","sufi"] },
  // AL-GHAZALI
  { id:5, quote:"Ilmu tanpa amal adalah kegilaan, dan amal tanpa ilmu adalah kesesatan.", author:"Imam Al-Ghazali", authorDetail:"Teolog & Filsuf Islam, Persia (1058–1111)", source:"Ihya Ulumuddin", category:"Ilmu & Amal", color:"#2ecc71", border:"rgba(46,204,113,.25)", bg:"rgba(46,204,113,.08)", tags:["al-ghazali","ilmu","amal","hikmah"] },
  { id:6, quote:"Manusia adalah musuh bagi apa yang tidak ia ketahui.", author:"Imam Al-Ghazali", authorDetail:"Teolog & Filsuf Islam, Persia (1058–1111)", source:"Ihya Ulumuddin", category:"Ilmu & Akal", color:"#2ecc71", border:"rgba(46,204,113,.25)", bg:"rgba(46,204,113,.08)", tags:["al-ghazali","ilmu","akal","manusia"] },
  { id:7, quote:"Hati itu seperti cermin. Jika kamu terus menggosoknya dengan dzikir, ia akan bersinar dan memantulkan kebenaran.", author:"Imam Al-Ghazali", authorDetail:"Teolog & Filsuf Islam, Persia (1058–1111)", source:"Ihya Ulumuddin", category:"Hati & Batin", color:"#2ecc71", border:"rgba(46,204,113,.25)", bg:"rgba(46,204,113,.08)", tags:["al-ghazali","hati","dzikir","batin"] },
  { id:8, quote:"Berpikirlah sebelum berbicara, karena sesungguhnya kata-kata yang keluar dari mulut adalah cermin dari apa yang ada di dalam hati.", author:"Imam Al-Ghazali", authorDetail:"Teolog & Filsuf Islam, Persia (1058–1111)", source:"Bidayatul Hidayah", category:"Adab & Akhlak", color:"#2ecc71", border:"rgba(46,204,113,.25)", bg:"rgba(46,204,113,.08)", tags:["al-ghazali","adab","lisan","hati"] },
  // IBN ARABI
  { id:9, quote:"Hatiku telah mampu menerima setiap bentuk. Ia adalah padang rumput bagi kijang dan biara bagi para rahib.", author:"Ibnu Arabi", authorDetail:"Sufi & Filsuf Andalusia (1165–1240)", source:"Tarjuman Al-Ashwaq", category:"Cinta & Toleransi", color:"#9b59b6", border:"rgba(155,89,182,.3)", bg:"rgba(155,89,182,.08)", tags:["ibnu arabi","cinta","hati","sufi","tasawuf"] },
  { id:10, quote:"Tuhan adalah cermin tempat kamu melihat dirimu, dan kamu adalah cermin tempat Tuhan memanifestasikan nama-nama-Nya.", author:"Ibnu Arabi", authorDetail:"Sufi & Filsuf Andalusia (1165–1240)", source:"Fusus Al-Hikam", category:"Jiwa & Makrifat", color:"#9b59b6", border:"rgba(155,89,182,.3)", bg:"rgba(155,89,182,.08)", tags:["ibnu arabi","makrifat","jiwa","tasawuf"] },
  // IMAM SYAFI'I
  { id:11, quote:"Barangsiapa yang tidak pernah merasakan pahitnya belajar walau sesaat, ia akan meneguk hinanya kebodohan sepanjang hidupnya.", author:"Imam Syafi'i", authorDetail:"Ulama & Pendiri Mazhab Syafi'i (767–820)", source:"Diwan Imam Syafi'i", category:"Ilmu & Semangat", color:"#3498db", border:"rgba(52,152,219,.25)", bg:"rgba(52,152,219,.08)", tags:["syafi'i","ilmu","belajar","semangat"] },
  { id:12, arab:"صُنِ النَّفْسَ وَاحْمِلْهَا عَلَى مَا يُجَمِّلُهَا", quote:"Jaga dirimu dan bawakan ia kepada apa yang memperindahnya. Sesungguhnya kamu akan mendapatkan kenikmatan dalam menjaga diri.", author:"Imam Syafi'i", authorDetail:"Ulama & Pendiri Mazhab Syafi'i (767–820)", source:"Diwan Imam Syafi'i", category:"Akhlak & Jiwa", color:"#3498db", border:"rgba(52,152,219,.25)", bg:"rgba(52,152,219,.08)", tags:["syafi'i","akhlak","jiwa","diri"] },
  { id:13, quote:"Merantaulah, niscaya kamu akan menemukan pengganti dari orang-orang yang kamu tinggalkan. Bersungguh-sungguhlah, karena kenikmatan hidup ada dalam kesungguhan.", author:"Imam Syafi'i", authorDetail:"Ulama & Pendiri Mazhab Syafi'i (767–820)", source:"Diwan Imam Syafi'i", category:"Perantauan & Tekad", color:"#3498db", border:"rgba(52,152,219,.25)", bg:"rgba(52,152,219,.08)", tags:["syafi'i","merantau","tekad","semangat"] },
  // IBNU QAYYIM
  { id:14, quote:"Hati akan berkarat seperti besi berkarat karena air. Obatnya adalah istighfar dan dzikrullah.", author:"Ibnu Qayyim Al-Jauziyyah", authorDetail:"Ulama Hanabilah, Damaskus (1292–1350)", source:"Al-Fawa'id", category:"Hati & Batin", color:"#e74c3c", border:"rgba(231,76,60,.25)", bg:"rgba(231,76,60,.08)", tags:["ibnu qayyim","hati","istighfar","dzikir"] },
  { id:15, quote:"Sabar itu ada tiga: sabar untuk taat kepada Allah, sabar dari maksiat, dan sabar atas takdir Allah.", author:"Ibnu Qayyim Al-Jauziyyah", authorDetail:"Ulama Hanabilah, Damaskus (1292–1350)", source:"Madarijus Salikin", category:"Sabar", color:"#e74c3c", border:"rgba(231,76,60,.25)", bg:"rgba(231,76,60,.08)", tags:["ibnu qayyim","sabar","taat","takdir"] },
  { id:16, quote:"Akal adalah pemimpin, ilmu adalah pengawalnya, dan hawa nafsu adalah musuhnya.", author:"Ibnu Qayyim Al-Jauziyyah", authorDetail:"Ulama Hanabilah, Damaskus (1292–1350)", source:"Ighasatul Lahfan", category:"Akal & Nafsu", color:"#e74c3c", border:"rgba(231,76,60,.25)", bg:"rgba(231,76,60,.08)", tags:["ibnu qayyim","akal","nafsu","ilmu"] },
  // SAYYIDINA ALI
{ id:17, arab:"قِيمَةُ كُلِّ امْرِئٍ مَا يُحْسِنُهُ", quote:"Nilai seseorang adalah pada apa yang ia kuasai dengan baik.", author:"Sayyidina Ali", authorDetail:"Khalifah Keempat & Sepupu Nabi SAW", source:"Nahjul Balaghah", category:"Akhlak & Nilai Diri", color:"#c9a84c", border:"rgba(201,168,76,.3)", bg:"rgba(201,168,76,.08)", tags:["Sayyidina Ali","nilai diri","akhlak","keahlian"] },
{ id:18, quote:"Jadilah kamu orang yang berilmu, atau orang yang mencari ilmu, atau orang yang mendengarkan ilmu, atau orang yang mencintai ilmu. Jangan jadi yang kelima, maka kamu akan binasa.", author:"Sayyidina Ali", authorDetail:"Khalifah Keempat & Sepupu Nabi SAW", source:"Nahjul Balaghah", category:"Ilmu", color:"#c9a84c", border:"rgba(201,168,76,.3)", bg:"rgba(201,168,76,.08)", tags:["Sayyidina Ali","ilmu","belajar","hikmah"] },
{ id:19, quote:"Bicaralah kepada manusia sesuai dengan kadar akal mereka. Apakah kamu ingin Allah dan Rasul-Nya didustakan?", author:"Sayyidina Ali", authorDetail:"Khalifah Keempat & Sepupu Nabi SAW", source:"Nahjul Balaghah", category:"Hikmah Berbicara", color:"#c9a84c", border:"rgba(201,168,76,.3)", bg:"rgba(201,168,76,.08)", tags:["Sayyidina Ali","hikmah","lisan","akal"] },
  // IBNU SINA
  { id:20, quote:"Akal adalah obat terbaik. Kebodohan adalah penyakit terburuk.", author:"Ibnu Sina (Avicenna)", authorDetail:"Filsuf & Dokter Islam, Persia (980–1037)", source:"Al-Qanun fi Al-Tibb", category:"Akal & Ilmu", color:"#1abc9c", border:"rgba(26,188,156,.25)", bg:"rgba(26,188,156,.08)", tags:["ibnu sina","akal","ilmu","filsafat"] },
  { id:21, quote:"Tubuh yang sehat adalah hadiah terbesar. Jiwa yang tenang adalah kebahagiaan terbesar. Hati yang penuh syukur adalah kekayaan terbesar.", author:"Ibnu Sina (Avicenna)", authorDetail:"Filsuf & Dokter Islam, Persia (980–1037)", source:"Risalah Al-Qalb", category:"Jiwa & Kesehatan", color:"#1abc9c", border:"rgba(26,188,156,.25)", bg:"rgba(26,188,156,.08)", tags:["ibnu sina","jiwa","syukur","kesehatan"] },
  // AL-FARABI
  { id:22, quote:"Kebahagiaan sempurna hanya bisa dicapai melalui akal yang sempurna, yang memahami kebenaran tentang segala sesuatu yang ada.", author:"Al-Farabi", authorDetail:"Filsuf Islam, Asia Tengah (872–950)", source:"Ara Ahl Al-Madinah Al-Fadilah", category:"Filsafat & Kebahagiaan", color:"#9b59b6", border:"rgba(155,89,182,.3)", bg:"rgba(155,89,182,.08)", tags:["al-farabi","akal","kebahagiaan","filsafat"] },
  // IBN KHALDUN
  { id:23, quote:"Peradaban adalah hasil dari kerja sama manusia. Tanpa kerja sama, manusia tidak mampu memenuhi kebutuhan hidupnya.", author:"Ibnu Khaldun", authorDetail:"Sejarawan & Sosiolog Islam, Tunisia (1332–1406)", source:"Muqaddimah", category:"Masyarakat & Peradaban", color:"#e67e22", border:"rgba(230,126,34,.25)", bg:"rgba(230,126,34,.08)", tags:["ibnu khaldun","peradaban","masyarakat","sejarah"] },
  { id:24, quote:"Generasi pemenang adalah mereka yang tidak melupakan dari mana mereka berasal, dan tidak takut ke mana mereka akan pergi.", author:"Ibnu Khaldun", authorDetail:"Sejarawan & Sosiolog Islam, Tunisia (1332–1406)", source:"Muqaddimah", category:"Sejarah & Identitas", color:"#e67e22", border:"rgba(230,126,34,.25)", bg:"rgba(230,126,34,.08)", tags:["ibnu khaldun","sejarah","identitas","generasi"] },
  // HAFIZ
  { id:25, arab:"حافظ وصال دوست به یک جرعه باده داد", quote:"Bahkan anggur cinta Ilahi yang seteguk saja cukup untuk menghilangkan dahaga jiwa yang seribu tahun.", author:"Hafiz Shirazi", authorDetail:"Penyair Sufi, Persia (1315–1390)", source:"Diwan-e Hafiz", category:"Cinta Ilahi", color:"#e74c3c", border:"rgba(231,76,60,.25)", bg:"rgba(231,76,60,.08)", tags:["hafiz","cinta","sufi","jiwa","puisi"] },
  { id:26, quote:"Semua agama yang benar membawa seseorang menuju Kebenaran yang satu. Bedanya hanya pada jalan yang dilalui.", author:"Hafiz Shirazi", authorDetail:"Penyair Sufi, Persia (1315–1390)", source:"Diwan-e Hafiz", category:"Kebenaran & Makrifat", color:"#e74c3c", border:"rgba(231,76,60,.25)", bg:"rgba(231,76,60,.08)", tags:["hafiz","makrifat","kebenaran","sufi"] },
  // HASAN AL-BASHRI
  { id:27, quote:"Aku heran kepada orang yang diusir dari dunia, namun masih saja berlomba-lomba di dalamnya. Dan aku heran kepada orang yang mengimani kematian, namun ia masih tertawa.", author:"Hasan Al-Bashri", authorDetail:"Tabiin & Ulama Zuhud, Basra (642–728)", source:"Riwayat dari murid-muridnya", category:"Zuhud & Akhirat", color:"#2ecc71", border:"rgba(46,204,113,.25)", bg:"rgba(46,204,113,.08)", tags:["hasan al-bashri","zuhud","akhirat","dunia"] },
  { id:28, quote:"Wahai anak Adam, kamu mati setiap hari, namun kamu tidak sadar. Kamu kehilangan satu hari, dan kamu tidak pernah mendapatkannya kembali.", author:"Hasan Al-Bashri", authorDetail:"Tabiin & Ulama Zuhud, Basra (642–728)", source:"Az-Zuhd", category:"Waktu & Kesadaran", color:"#2ecc71", border:"rgba(46,204,113,.25)", bg:"rgba(46,204,113,.08)", tags:["hasan al-bashri","waktu","kesadaran","maut"] },
  // RABIA
  { id:29, quote:"Ya Allah, jika aku menyembah-Mu karena takut neraka, bakarlah aku di dalamnya. Jika aku menyembah-Mu karena mengharap surga, jauhkan aku darinya. Namun jika aku menyembah-Mu karena Engkau sendiri, janganlah sembunyikan keindahan-Mu yang abadi dariku.", author:"Rabi'ah Al-Adawiyyah", authorDetail:"Wali & Sufi Perempuan, Basra (717–801)", source:"Syair dan doa-doanya", category:"Cinta Ilahi & Ikhlas", color:"#c9a84c", border:"rgba(201,168,76,.3)", bg:"rgba(201,168,76,.08)", tags:["rabia","cinta ilahi","ikhlas","sufi","doa"] },
];

const POPULAR_TAGS = ["rumi","al-ghazali","sufi","cinta","ilmu","sabar","hati","ibnu qayyim","jiwa","makrifat","akhlak","zuhud","tasawuf","Sayyidina Ali","syafi'i"];

const KISAH_SUGGESTIONS = [
  "Kisah Layla dan Majnun",
  "Kisah Rumi dan Syams Tabrizi",
  "Kisah Rabiah Al-Adawiyyah",
  "Kisah Ibnu Sina dan perjalanan ilmunya",
  "Kisah Uwais Al-Qarni",
  "Kisah Imam Ghazali mencari kebenaran",
  "Kisah Burung Simurgh (Mantiq Al-Tayr)",
  "Kisah cinta Ibnu Hazm",
];

export default function HikmahPage() {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<Hikmah[]>([]);
  const [searched, setSearched] = useState(false);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"hikmah" | "kisah">("hikmah");

  const [kisahQuery, setKisahQuery] = useState("");
  const [kisahResult, setKisahResult] = useState("");
  const [kisahReferensi, setKisahReferensi] = useState<Referensi[]>([]);
  const [kisahHikmah, setKisahHikmah] = useState("");
  const [kisahLoading, setKisahLoading] = useState(false);
  const [kisahSearched, setKisahSearched] = useState(false);
  const [showReferensi, setShowReferensi] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  function doLocalSearch(query: string) {
    if (!query.trim()) return;
    setSearched(true); setExpanded(null); setActiveTag(null);
    const q = query.toLowerCase();
    setResults(HIKMAH_DATA.filter(h =>
      h.quote.toLowerCase().includes(q) || h.author.toLowerCase().includes(q) ||
      h.category.toLowerCase().includes(q) || h.tags.some(t => t.includes(q)) ||
      (h.arab && h.arab.includes(query))
    ));
  }

  function filterByTag(tag: string) {
    setActiveTag(tag); setSearch(""); setSearched(true); setExpanded(null);
    setResults(HIKMAH_DATA.filter(h => h.tags.includes(tag)));
  }

  function reset() {
    setSearch(""); setResults([]); setSearched(false); setActiveTag(null); setExpanded(null);
  }

  function resetKisah() {
    setKisahQuery(""); setKisahResult(""); setKisahReferensi([]);
    setKisahHikmah(""); setKisahSearched(false); setShowReferensi(false);
  }

  async function searchKisah(query: string) {
    if (!query.trim()) return;
    setKisahLoading(true); setKisahSearched(true);
    setKisahResult(""); setKisahReferensi([]); setKisahHikmah(""); setShowReferensi(false);
    try {
      const res = await fetch("/api/kisah", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      if (!res.ok) throw new Error("Server error");
      const data = await res.json();
      setKisahResult(data.result || "Kisah tidak ditemukan.");
      setKisahReferensi(data.referensi || []);
      setKisahHikmah(data.hikmah || "");
    } catch {
      setKisahResult("Gagal memuat kisah. Pastikan koneksi internet kamu stabil.");
    } finally {
      setKisahLoading(false);
    }
  }

  const HikmahCard = ({ h, i }: { h: Hikmah; i: number }) => (
    <div className="hikmah-card" style={{ borderColor: h.border, animationDelay: `${i * 0.03}s` }}
      onClick={() => setExpanded(expanded === i ? null : i)}>
      <div style={{ position:"absolute",top:0,left:0,right:0,height:1,background:`linear-gradient(90deg,transparent,${h.color}40,transparent)` }}/>
      <div className="h-badge" style={{ background:h.bg, color:h.color, border:`1px solid ${h.border}` }}>
        <BookOpen size={9}/> {h.category}
      </div>
      {h.arab && <div className="arab-text" style={{ borderRightColor:h.color }}>{h.arab}</div>}
      <p className={`quote-text ${expanded === i ? "" : "collapsed"}`}>&ldquo;{h.quote}&rdquo;</p>
      <span className="expand-btn" style={{ color:h.color }}>
        {expanded === i ? "▲ Sembunyikan" : "▼ Baca selengkapnya"}
      </span>
      <div className="h-tags">{h.tags.slice(0,4).map(t => <span key={t} className="h-tag">{t}</span>)}</div>
      <div className="h-footer">
        <div>
          <div className="h-author">{h.author}</div>
          <div className="h-authordetail">{h.authorDetail}</div>
        </div>
        {h.source && <span className="h-source-pill">{h.source}</span>}
      </div>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Playfair+Display:ital,wght@0,600;0,700;1,600&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');
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

        .tab-row{display:flex;gap:8px;margin:16px 20px 0;}
        .tab-btn{flex:1;padding:10px 0;border-radius:12px;border:1px solid;font-family:'Plus Jakarta Sans',sans-serif;font-size:13px;font-weight:600;cursor:pointer;transition:all .2s;display:flex;align-items:center;justify-content:center;gap:6px;}
        .tab-btn.hikmah{background:var(--msj-card-bg);border-color:var(--msj-card-border);color:var(--msj-text-sub);}
        .tab-btn.kisah{background:var(--msj-card-bg);border-color:var(--msj-card-border);color:var(--msj-text-sub);}
        .tab-btn.active-hikmah{background:rgba(201,168,76,.15);border-color:rgba(201,168,76,.5);color:#c9a84c;}
        .tab-btn.active-kisah{background:rgba(155,89,182,.12);border-color:rgba(155,89,182,.4);color:#9b59b6;}

        .search-wrap{position:relative;margin:16px 20px 0;}
        .search-box{display:flex;align-items:center;gap:10px;background:var(--msj-input-bg);border:1px solid var(--msj-input-border);border-radius:14px;padding:12px 14px;transition:border-color .2s;}
        .search-box:focus-within{border-color:var(--msj-input-focus);}
        .search-input{flex:1;border:none;outline:none;font-family:'Plus Jakarta Sans',sans-serif;font-size:14px;color:var(--msj-input-text);background:transparent;}
        .search-input::placeholder{color:var(--msj-input-placeholder);}
        .search-btn{background:var(--msj-search-btn-bg);border:1px solid var(--msj-gold-border);border-radius:10px;padding:8px 16px;color:var(--msj-text-title);font-family:'Plus Jakarta Sans',sans-serif;font-size:12px;font-weight:600;cursor:pointer;flex-shrink:0;transition:all .2s;}
        .search-btn:hover{border-color:var(--msj-gold-bright);}
        .search-btn:disabled{opacity:.45;cursor:not-allowed;}
        .clear-btn{background:none;border:none;cursor:pointer;padding:2px;color:var(--msj-text-muted);line-height:0;}

        .sec-head{display:flex;align-items:center;gap:10px;padding:0 20px;margin:20px 0 12px;}
        .sec-line{flex:1;height:1px;}
        .sl{background:var(--msj-divider-line-l);}
        .sr{background:var(--msj-divider-line-r);}
        .sec-text{font-size:9px;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;color:var(--msj-divider-text);white-space:nowrap;}

        .tags{display:flex;flex-wrap:wrap;gap:8px;padding:0 20px;}
        .tag{background:var(--msj-card-bg);border:1px solid var(--msj-card-border);border-radius:20px;padding:7px 14px;font-size:12px;font-weight:600;color:var(--msj-gold-text);cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;transition:all .15s;}
        .tag:hover,.tag.active{background:var(--msj-gold-bg);border-color:var(--msj-gold-bright);color:var(--msj-text-title);}

        .hikmah-cards{display:flex;flex-direction:column;gap:12px;padding:0 20px;}
        .hikmah-card{background:var(--msj-card-bg);border-radius:18px;padding:18px;position:relative;overflow:hidden;border:1px solid;animation:fadeUp .4s ease both;cursor:pointer;}
        .h-badge{display:inline-flex;align-items:center;gap:5px;padding:4px 12px;border-radius:20px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.8px;margin-bottom:12px;}
        .arab-text{font-family:'Amiri',serif;font-size:20px;line-height:2.1;text-align:right;direction:rtl;color:var(--msj-text-title);padding:12px;border-radius:10px;margin-bottom:10px;border-right:3px solid;background:var(--msj-card-bg);}
        .quote-text{font-family:'Playfair Display',serif;font-size:14px;font-style:italic;line-height:1.8;color:var(--msj-text-desc);}
        .quote-text.collapsed{display:-webkit-box;-webkit-line-clamp:4;-webkit-box-orient:vertical;overflow:hidden;}
        .expand-btn{font-size:11px;font-weight:600;margin-top:8px;cursor:pointer;display:inline-block;}
        .h-tags{display:flex;flex-wrap:wrap;gap:4px;margin-top:10px;}
        .h-tag{font-size:9px;padding:2px 8px;border-radius:10px;background:var(--msj-card-bg);color:var(--msj-text-muted);border:1px solid var(--msj-card-border);}
        .h-footer{display:flex;align-items:flex-end;justify-content:space-between;margin-top:10px;padding-top:10px;border-top:1px solid var(--msj-card-border);gap:8px;}
        .h-author{font-size:12px;font-weight:700;color:var(--msj-text-title);}
        .h-authordetail{font-size:10px;color:var(--msj-text-muted);margin-top:2px;}
        .h-source-pill{font-size:10px;font-weight:600;padding:3px 10px;border-radius:20px;background:var(--msj-card-bg);color:var(--msj-text-muted);white-space:nowrap;flex-shrink:0;}

        .kisah-panel{padding:0 20px;}
        .kisah-suggestions{display:flex;flex-wrap:wrap;gap:8px;}
        .kisah-sug{background:var(--msj-card-bg);border:1px solid var(--msj-card-border);border-radius:20px;padding:7px 14px;font-size:12px;color:var(--msj-text-sub);cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;transition:all .15s;}
        .kisah-sug:hover{background:rgba(155,89,182,.1);border-color:rgba(155,89,182,.4);color:#9b59b6;}

        .kisah-result{background:var(--msj-card-bg);border:1px solid rgba(155,89,182,.25);border-radius:18px;padding:20px;animation:fadeUp .4s ease both;}
        .kisah-result-title{font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#9b59b6;margin-bottom:12px;display:flex;align-items:center;gap:6px;}
        .kisah-body{font-family:'Playfair Display',serif;font-size:14px;line-height:2;color:var(--msj-text-desc);white-space:pre-wrap;}
        .kisah-hikmah{font-family:'Playfair Display',serif;font-size:13px;font-style:italic;color:#c9a84c;text-align:center;padding:12px 16px;margin-top:14px;border-top:1px solid rgba(201,168,76,.2);border-bottom:1px solid rgba(201,168,76,.2);}

        .ref-toggle{display:flex;align-items:center;gap:8px;margin-top:14px;padding:10px 14px;border-radius:12px;border:1px solid rgba(155,89,182,.3);background:rgba(155,89,182,.06);cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;font-size:12px;font-weight:600;color:#9b59b6;width:100%;transition:all .2s;}
        .ref-toggle:hover{background:rgba(155,89,182,.12);}
        .ref-list{margin-top:10px;display:flex;flex-direction:column;gap:8px;animation:fadeUp .3s ease both;}
        .ref-item{background:var(--msj-card-bg);border:1px solid var(--msj-card-border);border-radius:12px;padding:12px 14px;border-left:3px solid #9b59b6;}
        .ref-judul{font-size:13px;font-weight:700;color:var(--msj-text-title);}
        .ref-penulis{font-size:11px;color:#9b59b6;margin-top:2px;}
        .ref-ket{font-size:11px;color:var(--msj-text-muted);margin-top:4px;line-height:1.6;}

        .kisah-loading{display:flex;flex-direction:column;align-items:center;gap:12px;padding:40px 20px;background:var(--msj-card-bg);border-radius:18px;border:1px solid rgba(155,89,182,.2);}
        .spin{animation:spin 1s linear infinite;}
        .empty-box{margin:0 20px;background:var(--msj-card-bg);border:1px solid var(--msj-card-border);border-radius:18px;padding:40px 20px;text-align:center;}
        .action-row{display:flex;gap:8px;margin-top:14px;padding-top:12px;border-top:1px solid var(--msj-card-border);}

        :root{
          --msj-hadist-header-bg:linear-gradient(160deg,#1a0e00 0%,#4a2e00 40%,#2d1a00 100%);
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
              <div style={{width:48,height:48,borderRadius:14,flexShrink:0,background:"var(--msj-gold-bg)",border:"1px solid var(--msj-gold-border)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>✦</div>
              <div>
                <div className="hd-title">Hikmah & Kisah</div>
                <div className="hd-sub">{HIKMAH_DATA.length} Kalam Hikmah · Ulama & Filsuf Islam</div>
              </div>
            </div>
          </div>
        </div>

        <div className="wrap">
          <div className="tab-row">
            <button className={`tab-btn hikmah ${activeTab==="hikmah"?"active-hikmah":""}`} onClick={() => setActiveTab("hikmah")}>
              <Feather size={13}/> Kalam Hikmah
            </button>
            <button className={`tab-btn kisah ${activeTab==="kisah"?"active-kisah":""}`} onClick={() => setActiveTab("kisah")}>
              <Scroll size={13}/> Cari Kisah <Sparkles size={10}/>
            </button>
          </div>

          {/* TAB HIKMAH */}
          {activeTab === "hikmah" && (
            <>
              <div className="search-wrap">
                <div className="search-box">
                  <Search size={15} color="var(--msj-gold-text)"/>
                  <input ref={inputRef} className="search-input" placeholder="Cari hikmah... (rumi, sabar, cinta...)"
                    value={search} onChange={e => setSearch(e.target.value)}
                    onKeyDown={e => { if (e.key==="Enter") doLocalSearch(search); }} autoComplete="off"/>
                  {(search||searched) && <button className="clear-btn" onClick={reset}><X size={14}/></button>}
                  <button className="search-btn" onClick={() => doLocalSearch(search)} disabled={!search.trim()}>Cari</button>
                </div>
              </div>

              {searched && (
                <>
                  <div className="sec-head">
                    <div className="sec-line sl"/>
                    <span className="sec-text">✦ {results.length} Hikmah {activeTag?`— ${activeTag}`:"Ditemukan"} ✦</span>
                    <div className="sec-line sr"/>
                  </div>
                  {results.length === 0 ? (
                    <div className="empty-box">
                      <div style={{fontSize:36,opacity:.3,marginBottom:12}}>🔍</div>
                      <p style={{fontSize:14,fontWeight:600,color:"var(--msj-text-sub)"}}>Hikmah tidak ditemukan</p>
                      <p style={{fontSize:12,color:"var(--msj-text-muted)",marginTop:4}}>Coba kata kunci lain</p>
                    </div>
                  ) : (
                    <div className="hikmah-cards">
                      {results.map((h,i) => <HikmahCard key={h.id} h={h} i={i}/>)}
                    </div>
                  )}
                </>
              )}

              <div className="sec-head"><div className="sec-line sl"/><span className="sec-text">✦ Pilih Topik ✦</span><div className="sec-line sr"/></div>
              <div className="tags">
                {POPULAR_TAGS.map(t => (
                  <button key={t} className={`tag ${activeTag===t?"active":""}`} onClick={() => filterByTag(t)}>{t}</button>
                ))}
              </div>

              {!searched && (
                <>
                  <div className="sec-head" style={{marginTop:24}}><div className="sec-line sl"/><span className="sec-text">✦ Semua Hikmah ✦</span><div className="sec-line sr"/></div>
                  <div className="hikmah-cards">
                    {HIKMAH_DATA.map((h,i) => <HikmahCard key={h.id} h={h} i={i}/>)}
                  </div>
                </>
              )}
            </>
          )}

          {/* TAB KISAH */}
          {activeTab === "kisah" && (
            <>
              <div className="search-wrap">
                <div className="search-box">
                  <Scroll size={15} color="#9b59b6"/>
                  <input className="search-input" placeholder="Cari kisah... (Layla Majnun, Uwais...)"
                    value={kisahQuery} onChange={e => setKisahQuery(e.target.value)}
                    onKeyDown={e => { if (e.key==="Enter") searchKisah(kisahQuery); }} autoComplete="off"/>
                  {kisahQuery && <button className="clear-btn" onClick={resetKisah}><X size={14}/></button>}
                  <button className="search-btn"
                    style={{background:"linear-gradient(135deg,#4a1a6e,#6e2fa0)",borderColor:"rgba(155,89,182,.4)"}}
                    onClick={() => searchKisah(kisahQuery)} disabled={!kisahQuery.trim()||kisahLoading}>
                    {kisahLoading?"...":"Cari"}
                  </button>
                </div>
              </div>

              {!kisahSearched && (
                <>
                  <div className="sec-head"><div className="sec-line sl"/><span className="sec-text">✦ Kisah Populer ✦</span><div className="sec-line sr"/></div>
                  <div className="kisah-panel">
                    <div className="kisah-suggestions">
                      {KISAH_SUGGESTIONS.map(s => (
                        <button key={s} className="kisah-sug" onClick={() => { setKisahQuery(s); searchKisah(s); }}>{s}</button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {kisahLoading && (
                <>
                  <div className="sec-head"><div className="sec-line sl"/><span className="sec-text" style={{color:"#9b59b6"}}>✦ Mengurai Kisah ✦</span><div className="sec-line sr"/></div>
                  <div className="kisah-panel">
                    <div className="kisah-loading">
                      <Loader2 size={28} color="#9b59b6" className="spin"/>
                      <p style={{fontSize:13,color:"var(--msj-text-sub)",fontFamily:"'Playfair Display',serif",fontStyle:"italic"}}>Membuka lembaran kisah lama...</p>
                    </div>
                  </div>
                </>
              )}

              {kisahSearched && !kisahLoading && kisahResult && (
                <>
                  <div className="sec-head"><div className="sec-line sl"/><span className="sec-text" style={{color:"#9b59b6"}}>✦ Kisah ✦</span><div className="sec-line sr"/></div>
                  <div className="kisah-panel">
                    <div className="kisah-result">
                      <div className="kisah-result-title"><Scroll size={12}/> {kisahQuery}</div>
                      <div className="kisah-body">{kisahResult}</div>

                      {kisahHikmah && (
                        <div className="kisah-hikmah">✦ {kisahHikmah} ✦</div>
                      )}

                      {kisahReferensi.length > 0 && (
                        <>
                          <button className="ref-toggle" onClick={() => setShowReferensi(!showReferensi)}>
                            <ExternalLink size={13}/>
                            {showReferensi ? "Sembunyikan Referensi" : `Lihat Referensi (${kisahReferensi.length} Sumber)`}
                            <span style={{marginLeft:"auto"}}>{showReferensi?"▲":"▼"}</span>
                          </button>
                          {showReferensi && (
                            <div className="ref-list">
                              {kisahReferensi.map((r, i) => (
                                <div key={i} className="ref-item">
                                  <div className="ref-judul">📖 {r.judul}</div>
                                  <div className="ref-penulis">{r.penulis}</div>
                                  <div className="ref-ket">{r.keterangan}</div>
                                </div>
                              ))}
                            </div>
                          )}
                        </>
                      )}

                      <div className="action-row">
                        <button className="search-btn"
                          style={{background:"var(--msj-card-bg)",borderColor:"var(--msj-card-border)",color:"var(--msj-text-sub)",fontSize:11}}
                          onClick={resetKisah}>
                          ← Cari Kisah Lain
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
              <div style={{height:32}}/>
            </>
          )}
        </div>
        <div style={{height:24}}/>
      </div>
    </>
  );
}