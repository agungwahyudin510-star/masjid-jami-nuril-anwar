"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import {
  BookOpen,
  Bell,
  Wallet,
  LogOut,
  ShieldCheck,
} from "lucide-react";

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    const auth =
      localStorage.getItem("admin-auth");

    if (!auth) {
      router.push("/admin-login");
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem(
      "admin-auth"
    );

    router.push("/admin-login");
  };

  return (
    <main className="min-h-screen bg-slate-100">

      {/* HEADER */}

      <div className="bg-gradient-to-r from-emerald-700 to-emerald-500 text-white p-6 rounded-b-3xl shadow-lg">

        <div className="flex items-center gap-4">

          <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">

            <ShieldCheck size={28} />

          </div>

          <div>

            <h1 className="text-2xl font-bold">
              Dashboard Admin
            </h1>

            <p className="text-sm opacity-80">
              Masjid Jami' Nuril Anwar
            </p>

          </div>

        </div>

      </div>

      <div className="max-w-md mx-auto p-4">

        <div className="space-y-4 mt-4">

          <Link
            href="/admin/kajian"
            className="flex items-center gap-4 bg-white p-5 rounded-3xl shadow"
          >
            <BookOpen className="text-emerald-600" />

            <div>
              <h2 className="font-bold">
                Kelola Kajian
              </h2>

              <p className="text-sm text-slate-500">
                Tambah & edit jadwal kajian
              </p>
            </div>
          </Link>

          <Link
            href="/admin/infaq"
            className="flex items-center gap-4 bg-white p-5 rounded-3xl shadow"
          >
            <Wallet className="text-emerald-600" />

            <div>
              <h2 className="font-bold">
                Kelola Infaq
              </h2>

              <p className="text-sm text-slate-500">
                Pemasukan & pengeluaran
              </p>
            </div>
          </Link>

          <Link
            href="/admin/pengumuman"
            className="flex items-center gap-4 bg-white p-5 rounded-3xl shadow"
          >
            <Bell className="text-emerald-600" />

            <div>
              <h2 className="font-bold">
                Kelola Pengumuman
              </h2>

              <p className="text-sm text-slate-500">
                Informasi untuk jamaah
              </p>
            </div>
          </Link>

        </div>

        <button
          onClick={handleLogout}
          className="w-full mt-8 bg-red-500 hover:bg-red-600 text-white p-4 rounded-3xl flex items-center justify-center gap-2"
        >
          <LogOut size={18} />

          Logout
        </button>

      </div>

    </main>
  );
}