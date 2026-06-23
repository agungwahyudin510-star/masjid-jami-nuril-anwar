import { NextRequest, NextResponse } from "next/server";

const BOOK_MAP: Record<string, { ind: string; ara: string; total: number }> = {
  bukhari:      { ind: "ind-bukhari",   ara: "ara-bukhari1",  total: 7563 },
  muslim:       { ind: "ind-muslim",    ara: "ara-muslim",    total: 5362 },
  "abu-dawud":  { ind: "ind-abudawud",  ara: "ara-abudawud",  total: 5274 },
  tirmidzi:     { ind: "ind-tirmidhi",  ara: "ara-tirmidhi",  total: 3956 },
  "ibnu-majah": { ind: "ind-ibnmajah",  ara: "ara-ibnmajah",  total: 4341 },
  nasai:        { ind: "ind-nasai",     ara: "ara-nasai",     total: 5758 },
  malik:        { ind: "ind-malik",     ara: "ara-malik",     total: 1832 },
  darimi:       { ind: "ind-darimi",    ara: "ara-darimi",    total: 3367 },
};

const BASE = "https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const book = searchParams.get("book") || "bukhari";
  const page = parseInt(searchParams.get("page") || "1");
  const q = searchParams.get("q")?.toLowerCase() || "";
  const limit = 10;

  const bookMeta = BOOK_MAP[book] || BOOK_MAP["bukhari"];

  try {
    // MODE SEARCH — ambil full book lalu filter
    if (q) {
      const [indRes, araRes] = await Promise.all([
        fetch(`${BASE}/${bookMeta.ind}.min.json`, { next: { revalidate: 86400 } }),
        fetch(`${BASE}/${bookMeta.ara}.min.json`, { next: { revalidate: 86400 } }),
      ]);

      const [indData, araData] = await Promise.all([
        indRes.json(),
        araRes.ok ? araRes.json() : { hadiths: [] },
      ]);

      const indHadiths: { hadithnumber: number; text: string }[] = indData?.hadiths || [];
      const araMap: Record<number, string> = {};
      (araData?.hadiths || []).forEach((h: { hadithnumber: number; text: string }) => {
        araMap[h.hadithnumber] = h.text;
      });

      const found = indHadiths
        .filter(h => h.text?.toLowerCase().includes(q))
        .slice(0, 30)
        .map(h => ({
          number: h.hadithnumber,
          arab: araMap[h.hadithnumber] || "",
          id: h.text,
          book,
        }));

      return NextResponse.json({ hadiths: found, total: found.length, page: 1, book, isSearch: true });
    }

    // MODE NORMAL — fetch per nomor secara parallel
    const start = (page - 1) * limit + 1;
    const nums = Array.from({ length: limit }, (_, i) => start + i).filter(n => n <= bookMeta.total);

    const results = await Promise.all(
      nums.map(async (num) => {
        const [indRes, araRes] = await Promise.all([
          fetch(`${BASE}/${bookMeta.ind}/${num}.min.json`, { next: { revalidate: 86400 } }),
          fetch(`${BASE}/${bookMeta.ara}/${num}.min.json`, { next: { revalidate: 86400 } }),
        ]);
        const [indData, araData] = await Promise.all([
          indRes.ok ? indRes.json() : null,
          araRes.ok ? araRes.json() : null,
        ]);
        if (!indData) return null;
        return {
          number: num,
          arab: araData?.hadiths?.[0]?.text || "",
          id: indData?.hadiths?.[0]?.text || "",
          book,
        };
      })
    );

    return NextResponse.json({
      hadiths: results.filter(Boolean),
      total: bookMeta.total,
      page,
      book,
      isSearch: false,
    });
  } catch (err) {
    console.error("Hadist error:", err);
    return NextResponse.json({ error: "Gagal mengambil data" }, { status: 500 });
  }
}