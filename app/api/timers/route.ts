import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { scheduleTimerWebhook } from "@/lib/qstash";

export async function GET() {
  const { data, error } = await supabase
    .from("breed_timers")
    .select("*")
    .order("ends_at", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ timers: data });
}

// POST: cria um timer. duration_seconds = quanto tempo a partir de agora até poder breedar de novo.
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { species, label, duration_seconds } = body as {
    species: string;
    label?: string;
    duration_seconds: number;
  };

  if (!species || !duration_seconds || duration_seconds <= 0) {
    return NextResponse.json({ error: "species e duration_seconds (>0) são obrigatórios." }, { status: 400 });
  }

  const endsAt = new Date(Date.now() + duration_seconds * 1000).toISOString();

  const { data: timer, error } = await supabase
    .from("breed_timers")
    .insert({ species, label: label || null, ends_at: endsAt })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const messageId = await scheduleTimerWebhook({
    timerId: timer.id,
    delaySeconds: duration_seconds
  });

  if (messageId) {
    await supabase.from("breed_timers").update({ qstash_message_id: messageId }).eq("id", timer.id);
  }

  return NextResponse.json({ timer });
}
