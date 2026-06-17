"use client";

import { useState } from "react";

type Anggota = { nama: string; jabatan?: string };
type Divisi = { nama: string; ketua?: string; anggota?: Anggota[]; tugas: string[] };
type Bidang = { nama: string; icon: string; color: string; border: string; ketuaBidang?: string; divisi: Divisi[] };

const STRUKTUR = {
  pelindung: ["Lurah Tanjungpura", "RW 014"],
  dewanSyuro: {
    anggota: ["Enung Sonjaya", "Agus Wardoyo", "Fahruroji", "Dudung Abdurrohman", "Solehudin", "Bayu Purnama"],
    tugas: [
      "Memberikan arah kebijakan umum berlandaskan Al-Qur'an dan As-Sunnah.",
      "Memberikan nasehat, pertimbangan, dan teguran kepada Pengurus Harian jika terjadi penyimpangan dari visi-misi masjid.",
      "Menjadi mediator jika terjadi perselisihan (islah) di dalam kepengurusan maupun jamaah.",
    ],
  },
  pengurusHarian: [
    { jabatan: "Ketua Umum Takmir", nama: "Sani Lupia Mahfud", tugas: ["Memimpin, mengkoordinasikan, dan mengendalikan seluruh jalannya organisasi.", "Membuat Strategic Planning tahunan masjid.", "Bertanggung jawab atas seluruh kegiatan baik ke dalam maupun ke luar."] },
    { jabatan: "Wakil Ketua", nama: "Reza Azhar", tugas: ["Membantu Ketua Umum dalam memimpin dan mengendalikan organisasi.", "Bertindak sebagai manajer operasional yang memastikan seluruh program berjalan lancar.", "Mewakili Ketua Umum apabila berhalangan hadir.", "Mengawasi dan mengevaluasi kinerja harian dan mingguan dari masing-masing bidang."] },
    { jabatan: "Sekretaris", nama: "Dede Amar", tugas: ["Mengelola tata kelola administrasi masjid (persuratan, arsip, stempel).", "Pemetaan Jamaah: Mendata warga sekitar masjid secara berkala.", "Menyusun notulensi rapat dan melaporkan evaluasi program kerja."] },
    { jabatan: "Bendahara Umum", nama: "Heriyanto (Ian)", tugas: ["Mengelola lalu lintas keuangan (pemasukan dan pengeluaran) masjid.", "Membuat laporan keuangan mingguan, bulanan, dan tahunan.", "Memastikan uang infak segera diubah menjadi fasilitas dan layanan bagi umat."] },
    { jabatan: "Wakil Bendahara", nama: "Adi Agus Permana", tugas: ["Membantu Bendahara Umum dalam pengelolaan keuangan masjid.", "Menggantikan tugas Bendahara Umum apabila berhalangan."] },
  ],
  bidang: [
    { nama: "Bidang Imarah", icon: "🕌", color: "rgba(46,204,113,0.7)", border: "rgba(46,204,113,0.2)", ketuaBidang: "Aldy Ramadhan", divisi: [
      { nama: "Divisi Peribadatan & Pendidikan", ketua: "Dwi Taruna", tugas: ["Menjadwalkan Imam Rawatib, Khatib Jumat, dan Muadzin.", "Memastikan bacaan imam fasih dan sesuai standar.", "Merencanakan kurikulum kajian (Kajian Subuh, Maghrib, Tafsir, Fiqih).", "Menjalankan sinergitas antar majlis ta'lim yang berkualitas."] },
      { nama: "Divisi Pembinaan Remaja Masjid", ketua: "Cristian Ramadan", tugas: ["Membina kaum muda dengan program kreatif (futsal, mabit, camping, pelatihan desain).", "Memastikan masjid tidak hanya diisi oleh kalangan tua.", "Mengembangkan program inovatif untuk menarik minat remaja."] },
      { nama: "Divisi Peringatan Hari Besar Islam", ketua: "Daday", tugas: ["Mengoordinasikan dan menyelenggarakan event keagamaan (Kampung Ramadhan, Idul Fitri/Adha, Maulid Nabi, Isra' Mi'raj).", "Memastikan event tidak hanya semarak spiritual tetapi juga menggerakkan ekonomi jamaah.", "Menyelenggarakan bazar atau pasar rakyat pada event besar."] },
    ]} as Bidang,
    { nama: "Bidang Riayah", icon: "🏗️", color: "rgba(201,168,76,0.7)", border: "rgba(201,168,76,0.2)", ketuaBidang: "Ust. Didin Syamsudin", divisi: [
      { nama: "Divisi Kebersihan", ketua: "Ade Supriatna", tugas: ["Memastikan area shalat, karpet, tempat wudhu, serta toilet dalam keadaan suci dan wangi 24 jam.", "Mengelola marbot/cleaning service.", "Memastikan tidak ada area licin atau kotor di seluruh lingkungan masjid."] },
      { nama: "Divisi Sarana Prasarana", ketua: "Hanafi Mahbubah & Nirwan", tugas: ["Memastikan kualitas sound system jernih (tidak pecah/bising).", "Memastikan AC/Kipas berfungsi baik.", "Memastikan ketersediaan air wudhu selalu ada."] },
      { nama: "Divisi Keamanan & Ketertiban", ketua: "Karna", tugas: ["Menjaga kendaraan jamaah agar aman dari pencurian.", "Menyambut jamaah dengan senyum di area parkir dan pintu masuk.", "Bertindak sebagai greeter tamu Allah."] },
    ]} as Bidang,
    { nama: "Bidang Idarah & Kemasyarakatan", icon: "🤝", color: "rgba(52,152,219,0.7)", border: "rgba(52,152,219,0.2)", ketuaBidang: "Herianto (Ladok)", divisi: [
      { nama: "Divisi Pelayanan & Pengurusan Jenazah", ketua: "Dani Ardiansyah", tugas: ["Memberikan pelayanan tanggap darurat bagi jamaah yang meninggal dunia.", "Mengurus sepenuhnya: memandikan, mengkafani, menyolatkan, menguburkan, hingga ambulans.", "Layanan GRATIS 100% — memastikan keluarga yang berduka tidak terbebani biaya."] },
      { nama: "Divisi Humas", ketua: "Agus Mukti & Aparat", tugas: ["Membangun dan merawat kemitraan dengan pemerintah daerah, RT/RW, dan lembaga lainnya.", "Menjadi jembatan komunikasi antara masjid dan masyarakat sekitar."] },
      { nama: "Divisi IT & Publikasi", ketua: "Singgih Dwiyanto & Yusuf", tugas: ["Mengelola website, media sosial (Instagram/YouTube), dan live streaming kajian.", "Membuat buletin Jum'at dan laporan keuangan visual.", "Memastikan informasi masjid tersampaikan secara digital kepada jamaah."] },
      { nama: "Divisi Kewirausahaan Masjid", ketua: "Jajang Nurjaman", tugas: ["Menciptakan kemandirian finansial masjid.", "Mengelola unit usaha masjid (aula, minimarket, air minum isi ulang).", "Memastikan pendapatan dari kewirausahaan mendukung operasional masjid."] },
    ]} as Bidang,
  ],
};

export default function OrganisasiPage() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const toggle = (key: string) => setExpanded(expanded === key ? null : key);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Playfair+Display:wght@600;700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');
        *,*::before,*::after { box-sizing:border-box; margin:0; padding:0; }

        body {
          background: var(--msj-bg);
          font-family: 'Plus Jakarta Sans', sans-serif;
          color: var(--msj-text-body);
        }

        .bg-base { position:fixed; inset:0; background:var(--msj-bg-gradient); z-index:0; }
        .bg-pat  { position:fixed; inset:0; opacity:var(--msj-pattern-opacity); z-index:0;
          background-image:url("data:image/svg+xml,%3Csvg width='120' height='120' viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23c9a84c' stroke-width='0.6'%3E%3Cpolygon points='60,6 114,33 114,87 60,114 6,87 6,33'/%3E%3Cpolygon points='60,22 98,42 98,78 60,98 22,78 22,42'/%3E%3C/g%3E%3C/svg%3E");
          background-size:120px 120px;
        }
        .bar   { position:fixed; left:0; right:0; height:2px; z-index:10; background:var(--msj-bar); }
        .bar-t { top:0; } .bar-b { bottom:0; }

        .org-root { min-height:100vh; position:relative; overflow-x:hidden; padding-bottom:80px; }
        .page     { position:relative; z-index:1; max-width:430px; margin:0 auto; padding:0 0 48px; }

        @keyframes fadeDown { from{opacity:0;transform:translateY(-14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeUp   { from{opacity:0;transform:translateY(16px)}  to{opacity:1;transform:translateY(0)} }

        /* Header */
        .org-header   { padding:24px 20px 16px; animation:fadeDown .6s cubic-bezier(.22,1,.36,1) both; }
        .bismillah    { font-family:'Amiri',serif; font-size:14px; color:var(--msj-bismillah); text-align:center; margin-bottom:14px; }
        .header-title { font-family:'Playfair Display',serif; font-size:22px; color:var(--msj-text-title); font-weight:700; margin-bottom:3px; }
        .header-sub   { font-size:11px; color:var(--msj-text-sub); }

        /* Section divider */
        .sec-div  { display:flex; align-items:center; gap:10px; padding:0 20px; margin:20px 0 12px; }
        .sdline   { flex:1; height:1px; }
        .sdl      { background:var(--msj-divider-line-l); }
        .sdr      { background:var(--msj-divider-line-r); }
        .sdtext   { font-size:9px; color:var(--msj-divider-text); letter-spacing:2.5px; text-transform:uppercase; white-space:nowrap; }

        /* Simple cards */
        .simple-cards { display:flex; flex-direction:column; gap:8px; padding:0 20px; }
        .simple-card  { background:var(--msj-card-bg); border:1px solid var(--msj-card-border); border-radius:14px; padding:14px 16px; display:flex; align-items:center; gap:12px; }
        .s-icon    { width:36px; height:36px; border-radius:10px; background:var(--msj-gold-bg); border:1px solid var(--msj-gold-border); display:flex; align-items:center; justify-content:center; font-size:16px; flex-shrink:0; }
        .s-nama    { font-size:13.5px; font-weight:600; color:var(--msj-text-title); }
        .s-jabatan { font-size:10.5px; color:var(--msj-text-sub); margin-top:2px; }

        /* Syuro */
        .syuro-card   { background:var(--msj-card-bg); border:1px solid var(--msj-card-border); border-radius:16px; overflow:hidden; margin:0 20px; }
        .syuro-card::before { content:''; display:block; height:1px; background:linear-gradient(90deg,transparent,var(--msj-gold-border),transparent); }
        .syuro-header { padding:16px; display:flex; align-items:center; gap:12px; cursor:pointer; }
        .syuro-icon   { width:42px; height:42px; border-radius:12px; background:var(--msj-gold-bg); border:1px solid var(--msj-gold-border); display:flex; align-items:center; justify-content:center; font-size:20px; flex-shrink:0; }
        .syuro-title  { flex:1; }
        .syuro-name   { font-size:14px; font-weight:700; color:var(--msj-text-title); }
        .syuro-sub    { font-size:11px; color:var(--msj-text-sub); margin-top:2px; }
        .chev         { transition:transform .25s; color:var(--msj-gold-text); }
        .chev.open    { transform:rotate(180deg); }
        .syuro-body   { border-top:1px solid var(--msj-card-border); padding:14px 16px; }
        .member-list  { display:flex; flex-wrap:wrap; gap:6px; margin-bottom:14px; }
        .member-chip  { padding:4px 10px; background:var(--msj-badge-bg); border:1px solid var(--msj-badge-border); border-radius:20px; font-size:11px; color:var(--msj-badge-text); }
        .tugas-list   { display:flex; flex-direction:column; gap:6px; }
        .tugas-item   { display:flex; align-items:flex-start; gap:8px; font-size:12px; color:var(--msj-text-desc); line-height:1.5; }
        .tugas-dot    { width:5px; height:5px; border-radius:50%; background:var(--msj-gold-bright); flex-shrink:0; margin-top:6px; opacity:.6; }

        /* Pengurus Harian */
        .ph-cards { display:flex; flex-direction:column; gap:10px; padding:0 20px; }
        .ph-card  { background:var(--msj-card-bg); border:1px solid var(--msj-card-border); border-radius:16px; overflow:hidden; }
        .ph-card::before { content:''; display:block; height:1px; background:linear-gradient(90deg,transparent,var(--msj-gold-border),transparent); }
        .ph-top   { padding:14px 16px; display:flex; align-items:center; gap:12px; cursor:pointer; }
        .ph-avatar  { width:40px; height:40px; border-radius:12px; background:var(--msj-green-bg); border:1px solid var(--msj-green-border); display:flex; align-items:center; justify-content:center; font-size:16px; flex-shrink:0; }
        .ph-info    { flex:1; }
        .ph-nama    { font-size:13.5px; font-weight:700; color:var(--msj-text-title); }
        .ph-jabatan { font-size:10.5px; color:var(--msj-gold-text); margin-top:2px; font-weight:600; }
        .ph-body    { border-top:1px solid var(--msj-card-border); padding:12px 16px; }

        /* Bidang */
        .bidang-wrap   { display:flex; flex-direction:column; gap:16px; padding:0 20px; }
        .bidang-card   { border-radius:18px; overflow:hidden; border:1px solid; }
        .bidang-header { padding:16px; display:flex; align-items:center; gap:14px; background:var(--msj-card-bg); }
        .bidang-icon   { width:46px; height:46px; border-radius:14px; display:flex; align-items:center; justify-content:center; font-size:22px; flex-shrink:0; background:var(--msj-card-bg); }
        .bidang-info   { flex:1; }
        .bidang-nama   { font-family:'Playfair Display',serif; font-size:15px; font-weight:700; color:var(--msj-text-title); }
        .bidang-ketua  { font-size:11px; color:var(--msj-text-sub); margin-top:3px; }
        .bidang-body   { background:var(--msj-org-bidang-body); padding:12px; }

        /* Divisi */
        .divisi-card  { background:var(--msj-card-bg); border:1px solid var(--msj-card-border); border-radius:12px; overflow:hidden; margin-bottom:8px; }
        .divisi-card:last-child { margin-bottom:0; }
        .divisi-top   { padding:12px 14px; display:flex; align-items:center; gap:10px; cursor:pointer; }
        .divisi-dot   { width:8px; height:8px; border-radius:50%; flex-shrink:0; }
        .divisi-info  { flex:1; }
        .divisi-nama  { font-size:13px; font-weight:600; color:var(--msj-text-title); }
        .divisi-ketua { font-size:10.5px; color:var(--msj-text-sub); margin-top:2px; }
        .divisi-body  { border-top:1px solid var(--msj-card-border); padding:10px 14px 12px; }
        .tugas-label  { font-size:9.5px; font-weight:700; letter-spacing:1.5px; text-transform:uppercase; color:var(--msj-text-muted); margin-bottom:8px; }

        /* Per-mode */
        :root {
          --msj-org-bidang-body: rgba(0,0,0,0.2);
        }
        html:not(.dark) {
          --msj-org-bidang-body: rgba(0,0,0,0.03);
        }
      `}</style>

      <div className="org-root">
        <div className="bg-base"/><div className="bg-pat"/>
        <div className="bar bar-t"/><div className="bar bar-b"/>

        <div className="page">
          <div className="org-header">
            <div className="bismillah">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>
            <div className="header-title">Struktur Organisasi</div>
            <div className="header-sub">Takmir Masjid Jami' Nuril Anwar — Karawang</div>
          </div>

          {/* PELINDUNG */}
          <div className="sec-div">
            <div className="sdline sdl"/><span className="sdtext">✦ Pelindung ✦</span><div className="sdline sdr"/>
          </div>
          <div className="simple-cards">
            {STRUKTUR.pelindung.map((n, i) => (
              <div key={i} className="simple-card">
                <div className="s-icon">🛡️</div>
                <div><div className="s-nama">{n}</div></div>
              </div>
            ))}
          </div>

          {/* DEWAN SYURO */}
          <div className="sec-div">
            <div className="sdline sdl"/><span className="sdtext">✦ Dewan Pembina & Penasehat ✦</span><div className="sdline sdr"/>
          </div>
          <div className="syuro-card">
            <div className="syuro-header" onClick={() => toggle("syuro")}>
              <div className="syuro-icon">📜</div>
              <div className="syuro-title">
                <div className="syuro-name">Dewan Syuro</div>
                <div className="syuro-sub">{STRUKTUR.dewanSyuro.anggota.length} anggota · Klik untuk lihat tugas</div>
              </div>
              <svg className={`chev ${expanded === "syuro" ? "open" : ""}`} width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 6l4 4 4-4"/></svg>
            </div>
            {expanded === "syuro" && (
              <div className="syuro-body">
                <div className="member-list">
                  {STRUKTUR.dewanSyuro.anggota.map((n, i) => (
                    <span key={i} className="member-chip">{n}</span>
                  ))}
                </div>
                <div className="tugas-label">Tugas Pokok</div>
                <div className="tugas-list">
                  {STRUKTUR.dewanSyuro.tugas.map((t, i) => (
                    <div key={i} className="tugas-item"><div className="tugas-dot"/>{t}</div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* PENGURUS HARIAN */}
          <div className="sec-div">
            <div className="sdline sdl"/><span className="sdtext">✦ Pengurus Harian ✦</span><div className="sdline sdr"/>
          </div>
          <div className="ph-cards">
            {STRUKTUR.pengurusHarian.map((ph, i) => (
              <div key={i} className="ph-card">
                <div className="ph-top" onClick={() => toggle(`ph-${i}`)}>
                  <div className="ph-avatar">👤</div>
                  <div className="ph-info">
                    <div className="ph-nama">{ph.nama}</div>
                    <div className="ph-jabatan">{ph.jabatan}</div>
                  </div>
                  <svg className={`chev ${expanded === `ph-${i}` ? "open" : ""}`} width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 6l4 4 4-4"/></svg>
                </div>
                {expanded === `ph-${i}` && (
                  <div className="ph-body">
                    <div className="tugas-label">Tugas Pokok</div>
                    <div className="tugas-list">
                      {ph.tugas.map((t, j) => (
                        <div key={j} className="tugas-item"><div className="tugas-dot"/>{t}</div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* BIDANG */}
          <div className="sec-div">
            <div className="sdline sdl"/><span className="sdtext">✦ Bidang & Divisi ✦</span><div className="sdline sdr"/>
          </div>
          <div className="bidang-wrap">
            {STRUKTUR.bidang.map((bidang, bi) => (
              <div key={bi} className="bidang-card" style={{borderColor: bidang.border}}>
                <div className="bidang-header">
                  <div className="bidang-icon" style={{border:`1px solid ${bidang.border}`}}>{bidang.icon}</div>
                  <div className="bidang-info">
                    <div className="bidang-nama">{bidang.nama}</div>
                    {bidang.ketuaBidang && <div className="bidang-ketua">Ketua: {bidang.ketuaBidang}</div>}
                  </div>
                </div>
                <div className="bidang-body">
                  {bidang.divisi.map((div, di) => (
                    <div key={di} className="divisi-card">
                      <div className="divisi-top" onClick={() => toggle(`b${bi}-d${di}`)}>
                        <div className="divisi-dot" style={{background: bidang.color}}/>
                        <div className="divisi-info">
                          <div className="divisi-nama">{div.nama}</div>
                          {(div.ketua || div.anggota) && (
                            <div className="divisi-ketua">
                              {div.ketua ? `Ketua: ${div.ketua}` : div.anggota?.map(a => a.nama).join(", ")}
                            </div>
                          )}
                        </div>
                        <svg className={`chev ${expanded === `b${bi}-d${di}` ? "open" : ""}`} width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 5l4 4 4-4"/></svg>
                      </div>
                      {expanded === `b${bi}-d${di}` && (
                        <div className="divisi-body">
                          <div className="tugas-label">Tugas Pokok</div>
                          <div className="tugas-list">
                            {div.tugas.map((t, ti) => (
                              <div key={ti} className="tugas-item">
                                <div className="tugas-dot" style={{background: bidang.color}}/>
                                {t}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}