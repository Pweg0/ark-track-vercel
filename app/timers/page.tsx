"use client";

import { useEffect, useState } from "react";

type Timer = {
  id: string;
  species: string;
  label: string | null;
  ends_at: string;
  notified: boolean;
};

export default function TimersPage() {
  const [timers, setTimers] = useState<Timer[]>([]);
  const [form, setForm] = useState({ species: "", label: "", hours: "8", minutes: "0" });

  function load() {
    fetch("/api/timers").then((r) => r.json()).then((d) => setTimers(d.timers || []));
  }
  useEffect(() => {
    load();
    const id = setInterval(load, 15000); // resincroniza com o servidor de vez em quando
    return () => clearInterval(id);
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!form.species) return;
    const duration_seconds = Number(form.hours) * 3600 + Number(form.minutes) * 60;
    if (duration_seconds <= 0) return;
    await fetch("/api/timers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ species: form.species, label: form.label || null, duration_seconds })
    });
    setForm({ species: "", label: "", hours: "8", minutes: "0" });
    load();
  }

  async function handleDelete(id: string) {
    await fetch(`/api/timers/${id}`, { method: "DELETE" });
    load();
  }

  const sorted = [...timers].sort((a, b) => new Date(a.ends_at).getTime() - new Date(b.ends_at).getTime());

  return (
    <div className="space-y-6">
      <h2 className="font-display text-3xl text-camp-bone">Timers de Breeding</h2>
      <p className="text-camp-dim text-sm -mt-3">
        Ao chegar em zero, avisa automaticamente no Discord da tribo — mesmo que ninguém esteja com o site aberto.
      </p>

      <form onSubmit={handleAdd} className="bg-camp-panel border border-camp-border rounded-lg p-5 grid sm:grid-cols-5 gap-3 items-end">
        <div className="sm:col-span-2">
          <label className="text-xs uppercase text-camp-dim tracking-wide">Espécie</label>
          <input
            value={form.species}
            onChange={(e) => setForm({ ...form, species: e.target.value })}
            placeholder="ex: Rex"
            className="w-full mt-1 bg-camp-bg border border-camp-border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="text-xs uppercase text-camp-dim tracking-wide">Rótulo (opcional)</label>
          <input
            value={form.label}
            onChange={(e) => setForm({ ...form, label: e.target.value })}
            placeholder="ex: Casal Principal"
            className="w-full mt-1 bg-camp-bg border border-camp-border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="text-xs uppercase text-camp-dim tracking-wide">Horas</label>
          <input
            type="number"
            min="0"
            value={form.hours}
            onChange={(e) => setForm({ ...form, hours: e.target.value })}
            className="w-full mt-1 bg-camp-bg border border-camp-border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="text-xs uppercase text-camp-dim tracking-wide">Minutos</label>
          <input
            type="number"
            min="0"
            max="59"
            value={form.minutes}
            onChange={(e) => setForm({ ...form, minutes: e.target.value })}
            className="w-full mt-1 bg-camp-bg border border-camp-border rounded px-3 py-2"
          />
        </div>
        <button type="submit" className="bg-camp-rust hover:bg-camp-rustdark px-4 py-2 rounded font-bold sm:col-span-5 sm:w-fit">
          iniciar timer
        </button>
      </form>

      <div className="space-y-3">
        {sorted.length === 0 && <p className="text-camp-dim text-sm">Nenhum timer rodando.</p>}
        {sorted.map((t) => (
          <TimerCard key={t.id} timer={t} onDelete={() => handleDelete(t.id)} />
        ))}
      </div>
    </div>
  );
}

function TimerCard({ timer, onDelete }: { timer: Timer; onDelete: () => void }) {
  const [remaining, setRemaining] = useState(() => new Date(timer.ends_at).getTime() - Date.now());

  useEffect(() => {
    const id = setInterval(() => setRemaining(new Date(timer.ends_at).getTime() - Date.now()), 1000);
    return () => clearInterval(id);
  }, [timer.ends_at]);

  const done = remaining <= 0;
  const h = Math.max(0, Math.floor(remaining / 3600000));
  const m = Math.max(0, Math.floor((remaining % 3600000) / 60000));
  const s = Math.max(0, Math.floor((remaining % 60000) / 1000));

  return (
    <div
      className={`bg-camp-panel border rounded-lg p-4 flex justify-between items-center ${
        done ? "border-camp-moss" : "border-camp-border"
      }`}
    >
      <div>
        <p className="text-camp-bone font-bold">
          {timer.species} {timer.label && <span className="text-camp-dim font-normal">— {timer.label}</span>}
        </p>
        <p className="text-xs text-camp-dim">até {new Date(timer.ends_at).toLocaleString("pt-BR")}</p>
      </div>
      <div className="flex items-center gap-4">
        {done ? (
          <span className="text-camp-moss font-display text-2xl">PRONTO ✓</span>
        ) : (
          <span className="font-mono text-camp-gold text-2xl">
            {h.toString().padStart(2, "0")}:{m.toString().padStart(2, "0")}:{s.toString().padStart(2, "0")}
          </span>
        )}
        <button onClick={onDelete} className="text-camp-dim hover:text-camp-alert text-xs">
          ✕
        </button>
      </div>
    </div>
  );
}
