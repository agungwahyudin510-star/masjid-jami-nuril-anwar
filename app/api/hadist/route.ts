import { NextRequest, NextResponse } from "next/server";
import { HADIST_DATA, Hadith } from "../../../lib/hadist-data";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const q = searchParams.get("q")?.toLowerCase() || "";

  if (!q) {
    return NextResponse.json([]);
  }

  const results = HADIST_DATA.filter(
    (h: Hadith) =>
      h.id.toLowerCase().includes(q) ||
      h.bookLabel.toLowerCase().includes(q) ||
      h.tags.some((tag: string) => tag.toLowerCase().includes(q))
  );

  return NextResponse.json(results);
}