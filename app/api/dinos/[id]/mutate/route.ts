import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { sendDiscordMessage } from "@/lib/discord";

// PATCH: atualiza mutations_count do stat ATUAL de uma linhagem e avisa no Discord
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const lineId = params.id;
  const { mutations_count } = await req.json();

  if (typeof mutations_count !== "number") {
    return NextResponse.json({ error: "mutations_count deve ser um número." }, { status: 400 });
  }

  const { data: line } = await supabase.from("dino_lines").select("*").eq("id", lineId).single();
  if (!line) {
    return NextResponse.json({ error: "Linhagem não encontrada." }, { status: 404 });
  }

  const { data: current, error } = await supabase
    .from("dino_stats")
    .update({ mutations_count })
    .eq("line_id", lineId)
    .eq("is_current", true)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await sendDiscordMessage(
    `🧬 **${line.species}** (${line.tag}, ${line.sex === "M" ? "macho" : "fêmea"}) foi mutado — agora com **${mutations_count}** mutações.`
  );

  return NextResponse.json({ stat: current });
}
