"use client";

import Link from "next/link";

import { useState } from "react";

import { Search } from "lucide-react";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

type Hadith = {
  number: number;
  arab: string;
  id: string;
};

export default function HadistPage() {

  const [search, setSearch] =
    useState("");

  const [results, setResults] =
    useState<any[]>([]);

  const [loading, setLoading] =
    useState(false);

  const searchHadith = async () => {

    if (!search) return;

    setLoading(true);

    try {

      const books = [
        "bukhari",
        "muslim",
        "abu-daud",
        "tirmidzi",
      ];

      let allResults: any[] = [];

      for (const book of books) {

        const response = await fetch(
          `https://api.hadith.gading.dev/books/${book}?range=1-300`
        );

        const data = await response.json();

        const filtered =
          data.data.hadiths.filter(
            (hadith: Hadith) =>
              hadith.id
                .toLowerCase()
                .includes(
                  search.toLowerCase()
                )
          );

        const mapped = filtered.map(
          (hadith: Hadith) => ({
            ...hadith,
            book,
          })
        );

        allResults = [
          ...allResults,
          ...mapped,
        ];
      }

      setResults(allResults);

    } catch (error) {

      console.error(error);

    } finally {

      setLoading(false);

    }
  };

  return (
    <main className="min-h-screen bg-[#020617] text-white p-4 pb-20">

      <div className="max-w-2xl mx-auto">

        {/* HEADER */}

        <div className="mb-6 flex items-center justify-between">

          <div>

            <h1 className="text-3xl font-bold">
              Hadist Search
            </h1>

            <p className="text-slate-400 mt-2">
              Cari hadist dari berbagai kitab
            </p>

          </div>

          <Link
            href="/"
            className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-2xl text-sm"
          >
            Kembali
          </Link>

        </div>

        {/* SEARCH */}

        <div className="flex gap-3 mb-6">

          <div className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 flex items-center gap-3">

            <Search
              size={18}
              className="text-slate-400"
            />

            <input
              type="text"
              placeholder="Cari hadist..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              className="bg-transparent outline-none w-full text-sm"
            />

          </div>

          <button
            onClick={searchHadith}
            className="bg-emerald-500 px-5 rounded-2xl font-semibold"
          >
            Cari
          </button>

        </div>

        {/* LOADING */}

        {loading && (

          <p className="text-slate-400">
            Mencari hadist...
          </p>

        )}

        {/* RESULTS */}

        <div className="space-y-6">

          {results.map(
            (hadith, index) => (

              <Card
                key={index}
                className="bg-slate-900 border border-slate-800 rounded-3xl text-white"
              >

                <CardContent className="p-6">

                  <div className="flex items-center justify-between mb-4">

                    <p className="text-emerald-400 text-sm">

                      {hadith.book}

                    </p>

                    <p className="text-slate-500 text-sm">

                      #{hadith.number}

                    </p>

                  </div>

                  {/* ARAB */}

                  <p className="text-3xl leading-loose text-right">

                    {hadith.arab}

                  </p>

                  {/* TERJEMAHAN */}

                  <p className="text-slate-300 mt-6 leading-relaxed">

                    {hadith.id}

                  </p>

                </CardContent>

              </Card>
            )
          )}

        </div>

      </div>

    </main>
  );
}