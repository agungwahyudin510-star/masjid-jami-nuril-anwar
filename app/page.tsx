"use client";

import { useEffect, useState } from "react";

import {
  Home,
  BookOpen,
  Bell,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

export default function HomePage() {
  const [time, setTime] = useState("");
const [prayerTimes, setPrayerTimes] = useState<any>(null);
const [nextPrayer, setNextPrayer] = useState("Maghrib");
const [countdown, setCountdown] = useState("");

  useEffect(() => {
    const fetchPrayerTimes = async () => {
      const prayerInterval = setInterval(() => {
  if (!prayerTimes) return;

  const prayers = [
    { name: "Subuh", time: prayerTimes.Fajr },
    { name: "Dzuhur", time: prayerTimes.Dhuhr },
    { name: "Ashar", time: prayerTimes.Asr },
    { name: "{nextPrayer}", time: prayerTimes.Maghrib },
    { name: "Isya", time: prayerTimes.Isha },
  ];

  const now = new Date();

  for (const prayer of prayers) {
    const [hours, minutes] = prayer.time.split(":");

    const prayerDate = new Date();

    prayerDate.setHours(hours);
    prayerDate.setMinutes(minutes);
    prayerDate.setSeconds(0);

    if (prayerDate > now) {
      setNextPrayer(prayer.name);

      const diff = prayerDate.getTime() - now.getTime();

      const hrs = Math.floor(diff / 1000 / 60 / 60);
      const mins = Math.floor((diff / 1000 / 60) % 60);
      const secs = Math.floor((diff / 1000) % 60);

      setCountdown(
        `${hrs.toString().padStart(2, "0")}:${mins
          .toString()
          .padStart(2, "0")}:${secs
          .toString()
          .padStart(2, "0")}`
      );

      break;
    }
  }
}, 1000);
  const response = await fetch("/api/prayer");
  const data = await response.json();

  setPrayerTimes(data);
};

fetchPrayerTimes();
    const updateTime = () => {
      const now = new Date();

      const formatted = now.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      });

      setTime(formatted);
    };

    updateTime();

    const interval = setInterval(updateTime, 1000);

    return () => {
  clearInterval(interval);
  clearInterval(prayerInterval);
};
  }, []);

  return (
    <main className="min-h-screen bg-[#020617] text-white pb-28">

      <div className="max-w-md mx-auto px-4 py-6">

        {/* HEADER */}

        <div className="flex items-center justify-between">

          <div>
            <p className="text-emerald-400 text-sm">
              Assalamu’alaikum
            </p>

            <h1 className="text-2xl font-bold mt-1">
              Nuril Anwar
            </h1>
          </div>

          <div className="text-right">
            <p className="text-2xl font-bold">
              {time}
            </p>

            <p className="text-slate-400 text-sm">
              Jumat, 29 Mei
            </p>
          </div>
        </div>

        {/* QUOTE */}

        <Card className="mt-6 bg-gradient-to-br from-emerald-500 to-emerald-700 border-0 rounded-3xl text-white">
          <CardContent className="p-6">

            <p className="text-sm opacity-80">
              Quote Hari Ini
            </p>

            <h2 className="text-xl font-semibold leading-relaxed mt-3">
              “Apa yang kau cari sedang mencarimu.”
            </h2>

            <p className="mt-4 text-sm opacity-80">
              — Jalaluddin Rumi
            </p>

          </CardContent>
        </Card>

        {/* PRAYER CARD */}

        <Card className="mt-6 bg-slate-900 border-slate-800 rounded-3xl text-white">
          <CardContent className="p-6">

            <p className="text-slate-400 text-sm">
              Waktu Sholat Berikutnya
            </p>

            <div className="flex items-end justify-between mt-4">

              <div>
                <h2 className="text-4xl font-bold">
                  {nextPrayer}
                </h2>

                <p className="text-emerald-400 text-lg mt-2">
                  {prayerTimes?.nextPrayer || "--:--"} WIB
                </p>
              </div>

              <div className="tex t-right">
                <p className="text-sm text-slate-400">
                  Countdown
                </p>

                <p className="text-xl font-semibold mt-1">
                  {countdown}
                </p>
              </div>

            </div>

            <Button className="w-full mt-6 rounded-2xl bg-emerald-500 hover:bg-emerald-600">
              Lihat Jadwal Lengkap
            </Button>

          </CardContent>
        </Card>

        {/* KAJIAN */}

        <div className="mt-8">

          <h3 className="text-lg font-semibold mb-4">
            Kajian Mendatang
          </h3>

          <Card className="bg-slate-900 border-slate-800 rounded-3xl text-white">
            <CardContent className="p-5">

              <p className="text-emerald-400 text-sm">
                Setiap Malam Senin
              </p>

              <h4 className="text-xl font-semibold mt-2">
                Kajian Tauhid
              </h4>

              <p className="text-slate-400 mt-2 text-sm">
                Ba’da Isya bersama Ustadz Abdullah
              </p>

            </CardContent>
          </Card>

        </div>

      </div>

      {/* BOTTOM NAVIGATION */}

      <div className="fixed bottom-0 left-0 right-0 border-t border-slate-800 bg-[#020617]/90 backdrop-blur-xl">

        <div className="max-w-md mx-auto px-6 py-4 flex items-center justify-between">

          <button className="flex flex-col items-center text-emerald-400">
            <Home size={22} />
            <span className="text-xs mt-1">
              Home
            </span>
          </button>

          <button className="flex flex-col items-center text-slate-400">
            <BookOpen size={22} />
            <span className="text-xs mt-1">
              Quran
            </span>
          </button>

          <button className="flex flex-col items-center text-slate-400">
            <Bell size={22} />
            <span className="text-xs mt-1">
              Kajian
            </span>
          </button>

          <button className="flex flex-col items-center text-slate-400">
            <Users size={22} />
            <span className="text-xs mt-1">
              Organisasi
            </span>
          </button>

        </div>

      </div>

    </main>
  );
}