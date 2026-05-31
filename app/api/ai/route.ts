import { NextRequest, NextResponse } from "next/server";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

const SYSTEM_PROMPT = `Kamu adalah asisten AI Islam yang bernama "Ustadz AI" untuk Masjid Jami' Nuril Anwar, Karawang.

Tugasmu:
- Menjawab pertanyaan seputar Islam dengan ramah, sopan, dan akurat
- Memberikan referensi dari Al-Quran dan Hadist bila relevan
- Menggunakan bahasa Indonesia yang mudah dipahami
- Selalu mengawali jawaban dengan basmala bila sesuai konteks
- Mengingatkan untuk berkonsultasi dengan ulama setempat untuk masalah yang kompleks

Topik yang bisa dijawab: fiqih, aqidah, akhlak, ibadah, doa, Al-Quran, hadist, sejarah Islam, dll.

Jika ditanya hal di luar Islam, arahkan kembali ke topik keislaman dengan sopan.`;

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages" }, { status: 400 });
    }

    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",   // gratis & cepat
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages.map((m: { role: string; content: string }) => ({
            role: m.role,
            content: m.content,
          })),
        ],
        temperature: 0.7,
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Groq error:", err);
      return NextResponse.json({ error: "Groq API error" }, { status: 500 });
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content ?? "Maaf, tidak ada jawaban.";

    return NextResponse.json({ reply });
  } catch (err) {
    console.error("Server error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}