"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const quotes = [
  {
    text: "Apa yang kau cari sedang mencarimu.",
    author: "Jalaluddin Rumi",
  },
  {
    text: "Luka adalah tempat cahaya masuk ke dalam dirimu.",
    author: "Jalaluddin Rumi",
  },
  {
    text: "Ilmu tanpa amal adalah kegilaan, amal tanpa ilmu adalah kesia-siaan.",
    author: "Imam Al-Ghazali",
  },
  {
    text: "Jangan tertundanya pemberian membuatmu putus asa.",
    author: "Ibnu Athaillah",
  },
  {
    text: "Di dalam hati terdapat kekosongan yang hanya dapat diisi dengan Allah.",
    author: "Ibnu Qayyim",
  },
];

export default function SplashPage() {
  const router = useRouter();

  const quote =
    quotes[Math.floor(Math.random() * quotes.length)];

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/home");
    }, 4000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <main className="min-h-screen bg-[#020617] flex items-center justify-center p-6">

      <div className="max-w-md text-center">

        <div className="text-6xl mb-6">
          ☪
        </div>

        <h1 className="text-3xl font-bold text-white mb-2">
          Masjid Jami' Nuril Anwar
        </h1>

        <p className="text-emerald-400 mb-10">
          Kata-Kata Hikmah Hari Ini
        </p>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8">

          <p className="text-xl text-white leading-relaxed italic">
            "{quote.text}"
          </p>

          <p className="text-emerald-400 mt-6">
            — {quote.author}
          </p>

        </div>

        <p className="text-slate-500 mt-8 text-sm">
          Memuat aplikasi...
        </p>

      </div>

    </main>
  );
}