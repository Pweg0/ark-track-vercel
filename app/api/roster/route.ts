import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const { data, error } = await supabase
    .from("roster")
    .select("*")
    .order("species", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ roster: data });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { species, sex, status, notes } = body;
  if (!species || !sex) {
    return NextResponse.json({ error: "species e sex são obrigatórios." }, { status: 400 });
  }
  const { data, error } = await supabase
    .from("roster")
    .insert({ species, sex, status: status || "need", notes: notes || null })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ item: data });
}
