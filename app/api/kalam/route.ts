import { NextRequest, NextResponse } from "next/server";

const VALID_TOPICS = ["layla","majnun","rumi","syams","rabia","ibnu sina","ghazali","uwais","simurgh","hafiz","ibnu arabi","ibnu qayyim","Sayyidina Ali","syafi","sufi","tasawuf","cinta","kisah","hikayat","cerita"];

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();
    if (!query || typeof query !== "string") {
      return NextResponse.json({ error: "Query tidak valid" }, { status: 400 });
    }

    const q = query.toLowerCase();
    const isValid = VALID_TOPICS.some(t => q.includes(t));
    if (!isValid) {
      return NextResponse.json({
        result: "",
        referensi: [],
        hikmah: "",
        error: "Kisah tidak ditemukan. Coba cari nama ulama, tokoh sufi, atau kisah klasik Islam."
      });
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY ?? ""}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        max_tokens: 1200,
        temperature: 0.8,
        messages: [
          {
            role: "system",
            content: `Kamu adalah pencerita kisah klasik Islam dan Sufi. Jawab HANYA dalam format JSON valid berikut, tanpa teks lain di luar JSON:
{
  "kisah": "teks cerita 250-400 kata, paragraf mengalir, bahasa Indonesia puitis, tanpa markdown heading",
  "referensi": [
    { "judul": "nama kitab/buku", "penulis": "nama penulis", "keterangan": "penjelasan singkat relevansi" }
  ],
  "hikmah": "satu kalimat hikmah penutup yang memorable"
}
Referensi harus 2-4 sumber nyata yang berkaitan dengan kisah.`,
          },
          {
            role: "user",
            content: `Ceritakan kisah: ${query}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Groq error:", err);
      return NextResponse.json({ error: "Gagal dari Groq API" }, { status: 500 });
    }

    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content ?? "";

    try {
      const clean = raw.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      return NextResponse.json({
        result: parsed.kisah ?? "Kisah tidak ditemukan.",
        referensi: parsed.referensi ?? [],
        hikmah: parsed.hikmah ?? "",
      });
    } catch {
      return NextResponse.json({ result: raw, referensi: [], hikmah: "" });
    }
  } catch (err) {
    console.error("Route error:", err);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}