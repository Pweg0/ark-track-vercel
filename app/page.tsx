"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Timer = { id: string; species: string; label: string | null; ends_at: string; notified: boolean };
type RosterItem = { id: string; species: string; sex: string; status: string };

export default function OverviewPage() {
  const [timers, setTimers] = useState<Timer[]>([]);
  const [roster, setRoster] = useState<RosterItem[]>([]);

  useEffect(() => {
    fetch("/api/timers").then((r) => r.json()).then((d) => setTimers(d.timers || []));
    fetch("/api/roster").then((r) => r.json()).then((d) => setRoster(d.roster || []));
  }, []);

  const activeTimers = timers.filter((t) => !t.notified && new Date(t.ends_at) > new Date());
  const needed = roster.filter((r) => r.status === "need");

  return (
    <div className="space-y-8">
      <div className="grid sm:grid-cols-3 gap-4">
        <StatCard title="Timers ativos" value={activeTimers.length} accent="rust" />
        <StatCard title="Faltando no plantel" value={needed.length} accent="alert" />
        <StatCard title="Itens no plantel" value={roster.length} accent="moss" />
      </div>

      <section className="bg-camp-panel border border-camp-border rounded-lg p-5">
        <h2 className="font-display text-2xl text-camp-bone mb-3">Próximos a breedar</h2>
        {activeTimers.length === 0 ? (
          <p className="text-camp-dim text-sm">Nenhum timer rodando. Vá na aba Breeding pra criar um.</p>
        ) : (
          <ul className="space-y-2">
            {activeTimers.slice(0, 5).map((t) => (
              <li key={t.id} className="flex justify-between text-sm border-b border-camp-border/50 pb-2">
                <span>
                  {t.species} {t.label ? <span className="text-camp-dim">— {t.label}</span> : null}
                </span>
                <CountdownInline endsAt={t.ends_at} />
              </li>
            ))}
          </ul>
        )}
        <Link href="/timers" className="text-camp-rust text-sm underline mt-3 inline-block">
          ver todos os timers →
        </Link>
      </section>

      <section className="bg-camp-panel border border-camp-border rounded-lg p-5">
        <h2 className="font-display text-2xl text-camp-bone mb-3">Faltando no plantel</h2>
        {needed.length === 0 ? (
          <p className="text-camp-dim text-sm">Nada faltando registrado. 🎉</p>
        ) : (
          <ul className="grid sm:grid-cols-2 gap-2">
            {needed.slice(0, 8).map((r) => (
              <li key={r.id} className="text-sm border-b border-camp-border/50 pb-2">
                <span className="text-camp-alert">falta</span> {r.sex === "M" ? "macho" : "fêmea"} de{" "}
                <strong>{r.species}</strong>
              </li>
            ))}
          </ul>
        )}
        <Link href="/roster" className="text-camp-rust text-sm underline mt-3 inline-block">
          ver plantel completo →
        </Link>
      </section>
    </div>
  );
}

function StatCard({ title, value, accent }: { title: string; value: number; accent: "rust" | "alert" | "moss" }) {
  const colors = { rust: "text-camp-rust", alert: "text-camp-alert", moss: "text-camp-moss" };
  return (
    <div className="bg-camp-panel border border-camp-border rounded-lg p-5">
      <p className="text-camp-dim text-xs uppercase tracking-wide mb-1">{title}</p>
      <p className={`font-display text-5xl ${colors[accent]}`}>{value}</p>
    </div>
  );
}

function CountdownInline({ endsAt }: { endsAt: string }) {
  const [remaining, setRemaining] = useState(() => new Date(endsAt).getTime() - Date.now());

  useEffect(() => {
    const id = setInterval(() => setRemaining(new Date(endsAt).getTime() - Date.now()), 1000);
    return () => clearInterval(id);
  }, [endsAt]);

  if (remaining <= 0) return <span className="text-camp-moss">pronto</span>;
  const h = Math.floor(remaining / 3600000);
  const m = Math.floor((remaining % 3600000) / 60000);
  const s = Math.floor((remaining % 60000) / 1000);
  return (
    <span className="font-mono text-camp-gold">
      {h.toString().padStart(2, "0")}:{m.toString().padStart(2, "0")}:{s.toString().padStart(2, "0")}
    </span>
  );
}
