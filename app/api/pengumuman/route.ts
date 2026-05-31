import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
 
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
 
export async function GET() {
  const { data, error } = await supabase
    .from("pengumuman")
    .select("*")
    .order("tanggal", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
 
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { judul, isi, tanggal } = body;
  const { data, error } = await supabase
    .from("pengumuman")
    .insert([{ judul, isi, tanggal, aktif: true }])
    .select();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
 
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const { error } = await supabase.from("pengumuman").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
 
export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { id, aktif } = body;
  const { error } = await supabase
    .from("pengumuman")
    .update({ aktif })
    .eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}