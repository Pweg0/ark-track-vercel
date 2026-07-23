import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { sendDiscordMessage } from "@/lib/discord";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { timerId, secret } = body as { timerId: string; secret: string };

  if (secret !== process.env.INTERNAL_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { data: timer } = await supabase.from("breed_timers").select("*").eq("id", timerId).single();

  // Timer pode ter sido apagado manualmente antes de vencer — nesse caso, ignora.
  if (!timer) {
    return NextResponse.json({ ok: true, skipped: "timer não existe mais" });
  }

  if (timer.notified) {
    return NextResponse.json({ ok: true, skipped: "já notificado" });
  }

  await supabase.from("breed_timers").update({ notified: true }).eq("id", timerId);

  const labelPart = timer.label ? ` (${timer.label})` : "";
  await sendDiscordMessage(`⏰ **${timer.species}**${labelPart} já pode breedar de novo!`);

  return NextResponse.json({ ok: true });
}
