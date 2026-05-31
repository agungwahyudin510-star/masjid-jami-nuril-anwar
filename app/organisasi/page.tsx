import Link from "next/link";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

const sections = [
  {
    title: "A. Pelindung",
    members: [
      "LURAH TANJUNGPURA",
      "RW 014",
    ],
  },

  {
    title: "B. Dewan Pembina & Penasehat",
    subtitle: "Dewan Syuro",
    members: [
      "ENUNG SONJAYA",
      "AGUS WARDOYO",
      "FAHRUROJI",
      "DUDUNG ABDURROHMAN",
      "SOLEHUDIN",
      "BAYU PURNAMA",
    ],
  },

  {
    title: "C. Pengurus Harian",
    subtitle: "Executive Leadership",
    members: [
      "Ketua Umum Takmir : SANI LUPIA MAHFUD",
      "Wakil Ketua : REZA AZHAR",
      "Sekretaris : DEDE AMAR",
      "Bendahara Umum : HERIANTO (IAN)",
      "Wakil Bendahara : ADI AGUS PERMANA",
    ],
  },

  {
    title: "D. Bidang Imarah",
    subtitle: "Peribadatan & Dakwah",
    members: [
      "Ketua Bidang : ALDY RAMADHAN",
      "Divisi Peribadatan & Pendidikan : DWI TARUNA",
      "Divisi Pembinaan Remaja Masjid : CRISTIAN RAMADAN",
      "Divisi PHBI : DADAY",
    ],
  },

  {
    title: "E. Bidang Riayah",
    subtitle: "Pemeliharaan Fisik & Pembangunan",
    members: [
      "Ketua Bidang : UST. DIDIN SYAMSUDIN",
      "Divisi Kebersihan : ADE SUPRIATNA",
      "Divisi Sarana Prasarana : HANAFI MAHBUBAH & NIRWAN",
      "Divisi Keamanan & Ketertiban : KARNA",
    ],
  },

  {
    title: "F. Bidang Idarah & Kemasyarakatan",
    subtitle: "Administrasi & Sosial",
    members: [
      "Ketua Bidang : HERIANTO (LADOK)",
      "Pelayanan & Pengurusan Jenazah : DANI ARDIANSYAH",
      "Divisi Humas : AGUS MUKTI & APARAT",
     
      "IT & Publikasi : SINGGIH DWIYANTO & YUSUF",
      "Divisi Kewirausahaan Masjid : JAJANG NURJAMAN",
    ],
  },
];

export default function OrganisasiPage() {

  return (
    <main className="min-h-screen bg-[#020617] text-white p-4 pb-24">

      <div className="max-w-3xl mx-auto">

        {/* HEADER */}

        <div className="mb-10 flex items-start justify-between gap-4">

          <div>

            <h1 className="text-3xl font-bold">
              Struktur Organisasi
            </h1>

            <p className="text-slate-400 mt-3 leading-relaxed">

              Susunan Pengurus Takmir
              Masjid Jami' Nuril Anwar
              disusun secara komprehensif
              untuk memastikan seluruh
              aspek pelayanan masjid
              berjalan optimal.

            </p>

          </div>

          <Link
            href="/"
            className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-2xl text-sm whitespace-nowrap"
          >
            Kembali
          </Link>

        </div>

        {/* SECTION */}

        <div className="space-y-6">

          {sections.map((section, index) => (

            <Card
              key={index}
              className="bg-slate-900 border border-slate-800 rounded-3xl text-white"
            >

              <CardContent className="p-6">

                <h2 className="text-xl font-bold text-emerald-400">

                  {section.title}

                </h2>

                {section.subtitle && (

                  <p className="text-slate-400 text-sm mt-1">

                    {section.subtitle}

                  </p>

                )}

                <div className="mt-6 space-y-4">

                  {section.members.map(
                    (member, idx) => (

                      <div
                        key={idx}
                        className="flex items-start gap-3 border-b border-slate-800 pb-3 last:border-none"
                      >

                        <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-sm font-bold">

                          {idx + 1}

                        </div>

                        <p className="text-slate-200 leading-relaxed">

                          {member}

                        </p>

                      </div>
                    )
                  )}

                </div>

              </CardContent>

            </Card>

          ))}

        </div>

      </div>

    </main>
  );
}