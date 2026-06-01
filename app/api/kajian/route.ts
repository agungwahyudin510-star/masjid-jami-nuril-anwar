import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
 
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
 
// GET — ambil semua kajian (urut tanggal)
export async function GET() {
  const { data, error } = await supabase
    .from("kajian")
    .select("*")
    .order("tanggal", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
 
// POST — tambah kajian
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { judul, ustadz, tanggal, waktu, tempat } = body;
  const { data, error } = await supabase
    .from("kajian")
    .insert([{ judul, ustadz, tanggal, waktu, tempat }])
    .select();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
 
// DELETE — hapus kajian by id
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const { error } = await supabase.from("kajian").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}