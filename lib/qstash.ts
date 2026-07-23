// Agenda uma mensagem única (não recorrente) pro QStash entregar exatamente
// no instante em que o timer de breeding zera. Isso evita depender de cron
// polling (que no plano free do Vercel só roda 1x/dia).
//
// Docs: https://upstash.com/docs/qstash/features/schedules (delay one-off)

const QSTASH_URL = "https://qstash.upstash.io/v2/publish";

export async function scheduleTimerWebhook(params: {
  timerId: string;
  delaySeconds: number;
}) {
  const token = process.env.QSTASH_TOKEN;
  const appUrl = process.env.APP_URL; // ex: https://seu-projeto.vercel.app
  const internalSecret = process.env.INTERNAL_WEBHOOK_SECRET;

  if (!token || !appUrl || !internalSecret) {
    console.warn("[qstash] Variáveis de ambiente ausentes, não foi possível agendar.");
    return null;
  }

  const destination = `${appUrl}/api/webhooks/timer-complete`;

  const res = await fetch(`${QSTASH_URL}/${encodeURIComponent(destination)}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "Upstash-Delay": `${Math.max(1, Math.floor(params.delaySeconds))}s`
    },
    body: JSON.stringify({
      timerId: params.timerId,
      secret: internalSecret
    })
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error("[qstash] Falha ao agendar:", res.status, text);
    return null;
  }

  const data = await res.json();
  return data.messageId as string | undefined;
}
