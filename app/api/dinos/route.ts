import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// GET: lista todas as linhagens com o stat atual + contagem de histórico
export async function GET() {
  const { data: lines, error: linesError } = await supabase
    .from("dino_lines")
    .select("*")
    .order("species", { ascending: true });

  if (linesError) {
    return NextResponse.json({ error: linesError.message }, { status: 500 });
  }

  const { data: stats, error: statsError } = await supabase
    .from("dino_stats")
    .select("*")
    .order("created_at", { ascending: false });

  if (statsError) {
    return NextResponse.json({ error: statsError.message }, { status: 500 });
  }

  const result = (lines || []).map((line) => {
    const lineStats = (stats || []).filter((s) => s.line_id === line.id);
    const current = lineStats.find((s) => s.is_current) || null;
    const history = lineStats.filter((s) => !s.is_current);
    return { ...line, current, history };
  });

  return NextResponse.json({ dinos: result });
}

// POST: cria uma linhagem nova (se não existir tag+species+sex) e insere um
// novo registro de stats como "atual", movendo o anterior pro histórico.
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { species, tag, sex, stats } = body as {
    species: string;
    tag: string;
    sex: "M" | "F";
    stats: {
      hp?: number;
      stamina?: number;
      oxygen?: number;
      food?: number;
      weight?: number;
      melee?: number;
      speed?: number;
      mutations_count?: number;
      notes?: string;
    };
  };

  if (!species || !tag || !sex) {
    return NextResponse.json({ error: "species, tag e sex são obrigatórios." }, { status: 400 });
  }

  // acha ou cria a linhagem
  let { data: existingLine } = await supabase
    .from("dino_lines")
    .select("*")
    .eq("species", species)
    .eq("tag", tag)
    .eq("sex", sex)
    .maybeSingle();

  let lineId = existingLine?.id;

  if (!lineId) {
    const { data: newLine, error: newLineError } = await supabase
      .from("dino_lines")
      .insert({ species, tag, sex })
      .select()
      .single();
    if (newLineError) {
      return NextResponse.json({ error: newLineError.message }, { status: 500 });
    }
    lineId = newLine.id;
  } else {
    // move o stat atual pro histórico
    await supabase
      .from("dino_stats")
      .update({ is_current: false })
      .eq("line_id", lineId)
      .eq("is_current", true);
  }

  const { data: newStat, error: newStatError } = await supabase
    .from("dino_stats")
    .insert({
      line_id: lineId,
      hp: stats?.hp ?? null,
      stamina: stats?.stamina ?? null,
      oxygen: stats?.oxygen ?? null,
      food: stats?.food ?? null,
      weight: stats?.weight ?? null,
      melee: stats?.melee ?? null,
      speed: stats?.speed ?? null,
      mutations_count: stats?.mutations_count ?? 0,
      notes: stats?.notes ?? null,
      is_current: true
    })
    .select()
    .single();

  if (newStatError) {
    return NextResponse.json({ error: newStatError.message }, { status: 500 });
  }

  return NextResponse.json({ line_id: lineId, stat: newStat });
}
