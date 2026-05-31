"use client";

import Link from "next/link";

import { useEffect, useState } from "react";

import { Search } from "lucide-react";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

type Surah = {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
};

export default function QuranPage() {

  const [surahs, setSurahs] =
    useState<Surah[]>([]);

  const [search, setSearch] =
    useState("");

  useEffect(() => {

    const fetchSurahs = async () => {

      try {

        const response = await fetch(
          "https://api.alquran.cloud/v1/surah"
        );

        const data = await response.json();

        setSurahs(data.data);

      } catch (error) {

        console.error(error);

      }
    };

    fetchSurahs();

  }, []);

  const filteredSurahs = surahs.filter(
    (surah) =>
      surah.englishName
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-[#020617] text-white p-4 pb-20">

      <div className="max-w-md mx-auto">

        <div className="mb-6 flex items-center justify-between">

          <div>

            <h1 className="text-3xl font-bold">
              Al Quran
            </h1>

            <p className="text-slate-400 mt-2">
              Baca dan pelajari Al-Quran
            </p>

          </div>

          <Link
            href="/"
            className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-2xl text-sm"
          >
            Kembali
          </Link>

        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 flex items-center gap-3 mb-6">

          <Search
            size={18}
            className="text-slate-400"
          />

          <input
            type="text"
            placeholder="Cari surat..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            className="bg-transparent outline-none w-full text-sm"
          />

        </div>

        <div className="space-y-4">

          {filteredSurahs.map((surah) => (

            <Link
              key={surah.number}
              href={`/quran/${surah.number}`}
            >

              <Card className="bg-slate-900 border border-slate-800 rounded-3xl text-white hover:border-emerald-500 transition-all">

                <CardContent className="p-5">

                  <div className="flex items-center justify-between">

                    <div>

                      <p className="text-emerald-400 text-sm">
                        Surah {surah.number}
                      </p>

                      <h2 className="text-xl font-semibold mt-1">
                        {surah.englishName}
                      </h2>

                      <p className="text-slate-400 text-sm mt-1">
                        {
                          surah.englishNameTranslation
                        }
                      </p>

                      <p className="text-slate-500 text-xs mt-2">
                        {surah.numberOfAyahs} Ayat
                      </p>

                    </div>

                    <div className="text-3xl">
                      {surah.name}
                    </div>

                  </div>

                </CardContent>

              </Card>

            </Link>

          ))}

        </div>

      </div>

    </main>
  );
}