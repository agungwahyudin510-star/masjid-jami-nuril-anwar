"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type PrayerTimes = {
  Fajr: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;

  hijriDate: string;
  gregorianDate: string;

  city: string;
  province: string;
};

export default function JadwalSholatPage() {
  const [prayerTimes, setPrayerTimes] =
    useState<PrayerTimes | null>(null);

  useEffect(() => {
    const fetchPrayerTimes = async () => {
      try {
        const response = await fetch("/api/prayer");
        const data = await response.json();

        setPrayerTimes(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchPrayerTimes();
  }, []);

  const today = new Date();

  const tanggalMasehi =
    today.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  return (
    <main className="min-h-screen bg-slate-100 p-4">

      <div className="max-w-md mx-auto">

        <Link
          href="/home"
          className="inline-block mb-6 text-emerald-700 font-medium"
        >
          ← Kembali
        </Link>

        <div className="bg-gradient-to-r from-emerald-700 to-emerald-500 rounded-3xl p-6 text-white shadow-lg mb-6">

          <h1 className="text-3xl font-bold">
            Jadwal Sholat
          </h1>

          <p className="mt-2 opacity-90">
            {prayerTimes?.city}, {prayerTimes?.province}
          </p>

          <p className="text-sm opacity-80 mt-1">
            {prayerTimes?.gregorianDate}
          </p>

<p className="text-sm opacity-80">
  {prayerTimes?.hijriDate}
</p>

        </div>

        <div className="space-y-4">

          <div className="bg-white p-5 rounded-3xl shadow flex justify-between">
            <span>🌅 Subuh</span>
            <span className="font-bold">
              {prayerTimes?.Fajr || "--:--"}
            </span>
          </div>

          <div className="bg-white p-5 rounded-3xl shadow flex justify-between">
            <span>☀️ Dzuhur</span>
            <span className="font-bold">
              {prayerTimes?.Dhuhr || "--:--"}
            </span>
          </div>

          <div className="bg-white p-5 rounded-3xl shadow flex justify-between">
            <span>🌤️ Ashar</span>
            <span className="font-bold">
              {prayerTimes?.Asr || "--:--"}
            </span>
          </div>

          <div className="bg-white p-5 rounded-3xl shadow flex justify-between">
            <span>🌇 Maghrib</span>
            <span className="font-bold">
              {prayerTimes?.Maghrib || "--:--"}
            </span>
          </div>

          <div className="bg-white p-5 rounded-3xl shadow flex justify-between">
            <span>🌙 Isya</span>
            <span className="font-bold">
              {prayerTimes?.Isha || "--:--"}
            </span>
          </div>

        </div>

      </div>

    </main>
  );
}