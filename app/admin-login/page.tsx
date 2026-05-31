"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";

export default function AdminLoginPage() {
  const [pin, setPin] = useState("");
  const router = useRouter();

  const handleLogin = () => {
    if (pin === "786786") {
      localStorage.setItem("admin-auth", "true");
      router.push("/admin");
    } else {
      alert("PIN Admin Salah!");
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-900 via-emerald-700 to-emerald-500 flex items-center justify-center p-4">

      <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-8">

        <div className="flex justify-center mb-4">
          <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center">
            <ShieldCheck
              size={42}
              className="text-emerald-700"
            />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-center text-slate-800">
          Admin Masjid
        </h1>

        <p className="text-center text-slate-500 mt-2">
          Login menggunakan PIN Admin
        </p>

        <input
          type="password"
          placeholder="Masukkan PIN"
          value={pin}
          onChange={(e) =>
            setPin(e.target.value)
          }
          className="w-full mt-6 p-4 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />

        <button
          onClick={handleLogin}
          className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 text-white p-4 rounded-2xl font-semibold transition"
        >
          Masuk Dashboard
        </button>

        <p className="text-center text-xs text-slate-400 mt-6">
          Masjid Jami' Nuril Anwar
        </p>

      </div>

    </main>
  );
}