import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  // Nota: isso remove o timer do painel, mas não cancela a mensagem já
  // agendada no QStash (o tier free do QStash não gasta nada por isso —
  // se a mensagem chegar depois, o webhook vê que o timer sumiu e ignora).
  const { error } = await supabase.from("breed_timers").delete().eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
