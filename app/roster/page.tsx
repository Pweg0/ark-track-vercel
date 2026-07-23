"use client";

import { useEffect, useState } from "react";

type RosterItem = {
  id: string;
  species: string;
  sex: "M" | "F";
  status: "have" | "need" | "pair_complete" | "breeding";
  notes: string | null;
};

const STATUS_LABEL: Record<string, string> = {
  have: "Tenho",
  need: "Falta",
  pair_complete: "Casal completo",
  breeding: "Breedando"
};

const STATUS_COLOR: Record<string, string> = {
  have: "text-camp-moss border-camp-moss",
  need: "text-camp-alert border-camp-alert",
  pair_complete: "text-camp-gold border-camp-gold",
  breeding: "text-camp-rust border-camp-rust"
};

export default function RosterPage() {
  const [items, setItems] = useState<RosterItem[]>([]);
  const [form, setForm] = useState({ species: "", sex: "F", status: "need", notes: "" });
  const [filter, setFilter] = useState<string>("all");

  function load() {
    fetch("/api/roster").then((r) => r.json()).then((d) => setItems(d.roster || []));
  }
  useEffect(load, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!form.species) return;
    await fetch("/api/roster", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    setForm({ species: "", sex: "F", status: "need", notes: "" });
    load();
  }

  async function handleStatusChange(id: string, status: string) {
    await fetch(`/api/roster/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });
    load();
  }

  async function handleDelete(id: string) {
    await fetch(`/api/roster/${id}`, { method: "DELETE" });
    load();
  }

  const filtered = filter === "all" ? items : items.filter((i) => i.status === filter);

  return (
    <div className="space-y-6">
      <h2 className="font-display text-3xl text-camp-bone">Plantel</h2>

      <form onSubmit={handleAdd} className="bg-camp-panel border border-camp-border rounded-lg p-5 grid sm:grid-cols-5 gap-3 items-end">
        <div className="sm:col-span-2">
          <label className="text-xs uppercase text-camp-dim tracking-wide">Espécie</label>
          <input
            value={form.species}
            onChange={(e) => setForm({ ...form, species: e.target.value })}
            placeholder="ex: Rex, Carbo, Deinonychus"
            className="w-full mt-1 bg-camp-bg border border-camp-border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="text-xs uppercase text-camp-dim tracking-wide">Sexo</label>
          <select
            value={form.sex}
            onChange={(e) => setForm({ ...form, sex: e.target.value })}
            className="w-full mt-1 bg-camp-bg border border-camp-border rounded px-3 py-2"
          >
            <option value="F">Fêmea</option>
            <option value="M">Macho</option>
          </select>
        </div>
        <div>
          <label className="text-xs uppercase text-camp-dim tracking-wide">Status</label>
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            className="w-full mt-1 bg-camp-bg border border-camp-border rounded px-3 py-2"
          >
            {Object.entries(STATUS_LABEL).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="bg-camp-rust hover:bg-camp-rustdark px-4 py-2 rounded font-bold">
          adicionar
        </button>
      </form>

      <div className="flex gap-2 flex-wrap">
        {["all", "need", "have", "pair_complete", "breeding"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-xs px-3 py-1 rounded border ${
              filter === f ? "border-camp-rust text-camp-rust" : "border-camp-border text-camp-dim"
            }`}
          >
            {f === "all" ? "Todos" : STATUS_LABEL[f]}
          </button>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        {filtered.map((item) => (
          <div key={item.id} className="bg-camp-panel border border-camp-border rounded-lg p-4 flex justify-between items-center">
            <div>
              <p className="text-camp-bone font-bold">
                {item.species} <span className="text-camp-dim font-normal">({item.sex === "M" ? "macho" : "fêmea"})</span>
              </p>
              {item.notes && <p className="text-xs text-camp-dim">{item.notes}</p>}
            </div>
            <div className="flex items-center gap-2">
              <select
                value={item.status}
                onChange={(e) => handleStatusChange(item.id, e.target.value)}
                className={`text-xs bg-camp-bg border rounded px-2 py-1 ${STATUS_COLOR[item.status]}`}
              >
                {Object.entries(STATUS_LABEL).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
              <button onClick={() => handleDelete(item.id)} className="text-camp-dim hover:text-camp-alert text-xs">
                ✕
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p className="text-camp-dim text-sm">Nada aqui ainda.</p>}
      </div>
    </div>
  );
}
