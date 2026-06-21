"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const quotes = [
  { text: "Apa yang kau cari sedang mencarimu.", author: "Jalaluddin Rumi" },
  { text: "Luka adalah tempat cahaya masuk ke dalam dirimu.", author: "Jalaluddin Rumi" },
  { text: "Ilmu tanpa amal adalah kegilaan, amal tanpa ilmu adalah kesia-siaan.", author: "Imam Al-Ghazali" },
  { text: "Jangan tertundanya pemberian membuatmu putus asa.", author: "Ibnu Athaillah" },
  { text: "Di dalam hati terdapat kekosongan yang hanya dapat diisi dengan Allah.", author: "Ibnu Qayyim" },
  { text: "Sabar bukan tentang berapa lama kau menunggu, tapi bagaimana sikapmu saat menunggu.", author: "Sayyidina Ali" },
  { text: "Barangsiapa mengenal dirinya, maka ia mengenal Tuhannya.", author: "Imam Al-Ghazali" },
];

export default function SplashPage() {
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [quote] = useState(() => quotes[Math.floor(Math.random() * quotes.length)]);
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Cek apakah sudah pernah lihat splash di sesi ini
    
    const seen = sessionStorage.getItem("splash-seen");

    if (seen) {
      // Sudah pernah lihat — langsung ke home
      router.replace("/home");
      return;
    }

    // Belum pernah lihat — tampilkan splash
    setShow(true);
    sessionStorage.setItem("splash-seen", "true");

    // Progress bar
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) { clearInterval(progressInterval); return 100; }
        return prev + 2;
      });
    }, 80);

    // Redirect setelah 4 detik
    const timer = setTimeout(() => {
      router.replace("/home");
    }, 4000);

    return () => {
      clearTimeout(timer);
      clearInterval(progressInterval);
    };
  }, [router]);

  // Jangan render apapun sebelum check sessionStorage selesai
  if (!show) return null;

  return (
    <main style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg, #0c3d20 0%, #166534 45%, #14532d 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 24, fontFamily: "'Nunito', sans-serif",
      position: "relative", overflow: "hidden",
    }}>

      {/* Ornamen background */}
      <div style={{
        position: "absolute", top: -80, right: -80,
        width: 300, height: 300, borderRadius: "50%",
        border: "1px solid rgba(212,167,50,.1)",
        boxShadow: "0 0 0 40px rgba(212,167,50,.05), 0 0 0 80px rgba(212,167,50,.02)",
      }} />
      <div style={{
        position: "absolute", bottom: -60, left: -60,
        width: 200, height: 200, borderRadius: "50%",
        border: "1px solid rgba(212,167,50,.08)",
        boxShadow: "0 0 0 30px rgba(212,167,50,.03)",
      }} />

      <div style={{ maxWidth: 360, width: "100%", textAlign: "center", position: "relative", zIndex: 1 }}>

        {/* Logo */}
        <div style={{
          width: 100, height: 100, borderRadius: 28,
          background: "rgba(255,255,255,.1)",
          border: "1px solid rgba(212,167,50,.3)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 20px",
          boxShadow: "0 8px 32px rgba(0,0,0,.2)",
          overflow: "hidden",
        }}>
          <img
            src="/icons/icon-192x192.png"
            alt="Logo Masjid"
            style={{ width: 100, height: 100, objectFit: "cover" }}
          />
        </div>

        {/* Nama masjid */}
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "#fff", marginBottom: 4 }}>
          Masjid Jami&apos; Nuril Anwar
        </h1>
        <p style={{ fontSize: 12, color: "rgba(212,167,50,.8)", marginBottom: 32, letterSpacing: "1px", textTransform: "uppercase" }}>
          Lengo &mdash; Tanjungpura &mdash; Karawang
        </p>

        {/* Quote card */}
        <div style={{
          background: "rgba(0,0,0,.25)",
          border: "1px solid rgba(212,167,50,.2)",
          borderRadius: 24, padding: "24px 20px",
          backdropFilter: "blur(10px)", marginBottom: 32,
        }}>
          <p style={{
            fontSize: 13, fontWeight: 700, color: "rgba(212,167,50,.7)",
            textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 12,
          }}>
            ✦ Hikmah Hari Ini
          </p>
          <p style={{
            fontSize: 17, color: "#fff", lineHeight: 1.7,
            fontStyle: "italic", marginBottom: 16,
            fontFamily: "'Georgia', serif",
          }}>
            &ldquo;{quote.text}&rdquo;
          </p>
          <div style={{
            height: 1,
            background: "linear-gradient(90deg, transparent, rgba(212,167,50,.4), transparent)",
            marginBottom: 12,
          }} />
          <p style={{ fontSize: 13, color: "rgba(212,167,50,.8)", fontWeight: 600 }}>
            &mdash; {quote.author}
          </p>
        </div>

        {/* Progress bar */}
        <div style={{
          height: 3, background: "rgba(255,255,255,.1)",
          borderRadius: 10, overflow: "hidden", marginBottom: 10,
        }}>
          <div style={{
            height: "100%", borderRadius: 10,
            background: "linear-gradient(90deg, #d4a732, #f0c84e)",
            width: `${progress}%`,
            transition: "width 0.1s linear",
          }} />
        </div>
        <p style={{ fontSize: 11, color: "rgba(255,255,255,.4)", letterSpacing: "1px" }}>
          Memuat aplikasi...
        </p>

      </div>
    </main>
  );
}