"use client";

import { useEffect, useState } from "react";

type Stat = {
  id: string;
  hp: number | null;
  stamina: number | null;
  oxygen: number | null;
  food: number | null;
  weight: number | null;
  melee: number | null;
  speed: number | null;
  mutations_count: number;
  notes: string | null;
  created_at: string;
};

type DinoLine = {
  id: string;
  species: string;
  tag: string;
  sex: "M" | "F";
  current: Stat | null;
  history: Stat[];
};

const FIELDS = [
  ["hp", "HP"],
  ["stamina", "Stamina"],
  ["oxygen", "Oxigênio"],
  ["food", "Food"],
  ["weight", "Peso"],
  ["melee", "Melee"],
  ["speed", "Velocidade"]
] as const;

export default function DinosPage() {
  const [dinos, setDinos] = useState<DinoLine[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<any>({ species: "", tag: "", sex: "F" });
  const [saving, setSaving] = useState(false);

  function load() {
    fetch("/api/dinos").then((r) => r.json()).then((d) => setDinos(d.dinos || []));
  }
  useEffect(load, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const stats: any = {};
    for (const [key] of FIELDS) if (form[key]) stats[key] = Number(form[key]);
    if (form.mutations_count) stats.mutations_count = Number(form.mutations_count);
    if (form.notes) stats.notes = form.notes;

    await fetch("/api/dinos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ species: form.species, tag: form.tag, sex: form.sex, stats })
    });

    setSaving(false);
    setShowForm(false);
    setForm({ species: "", tag: "", sex: "F" });
    load();
  }

  async function handleMutate(lineId: string, current: number) {
    const val = prompt("Novo total de mutações:", String(current));
    if (val === null) return;
    await fetch(`/api/dinos/${lineId}/mutate`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mutations_count: Number(val) })
    });
    load();
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="font-display text-3xl text-camp-bone">Genética</h2>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="bg-camp-rust hover:bg-camp-rustdark px-4 py-2 rounded text-sm font-bold"
        >
          {showForm ? "cancelar" : "+ novo registro"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-camp-panel border border-camp-border rounded-lg p-5 space-y-4">
          <p className="text-camp-dim text-xs">
            Se já existir uma linhagem com a mesma espécie + apelido + sexo, o registro atual dela vira
            histórico automaticamente e esse novo vira o "atual".
          </p>
          <div className="grid sm:grid-cols-3 gap-3">
            <Input label="Espécie" value={form.species} onChange={(v) => setForm({ ...form, species: v })} required />
            <Input label="Apelido / Linhagem" value={form.tag} onChange={(v) => setForm({ ...form, tag: v })} required />
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
          </div>

          <div className="grid sm:grid-cols-4 gap-3">
            {FIELDS.map(([key, label]) => (
              <Input
                key={key}
                label={label}
                value={form[key] || ""}
                onChange={(v) => setForm({ ...form, [key]: v })}
                type="number"
              />
            ))}
            <Input
              label="Mutações"
              value={form.mutations_count || ""}
              onChange={(v) => setForm({ ...form, mutations_count: v })}
              type="number"
            />
          </div>
          <Input label="Notas" value={form.notes || ""} onChange={(v) => setForm({ ...form, notes: v })} />

          <button
            type="submit"
            disabled={saving}
            className="bg-camp-moss text-camp-bg font-bold px-4 py-2 rounded disabled:opacity-50"
          >
            {saving ? "salvando..." : "salvar registro"}
          </button>
        </form>
      )}

      <div className="space-y-3">
        {dinos.length === 0 && <p className="text-camp-dim text-sm">Nenhuma linhagem cadastrada ainda.</p>}
        {dinos.map((d) => (
          <div key={d.id} className="bg-camp-panel border border-camp-border rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-display text-2xl text-camp-bone">
                  {d.species} <span className="text-camp-dim text-base">— {d.tag}</span>
                </p>
                <p className="text-xs text-camp-dim">{d.sex === "M" ? "Macho" : "Fêmea"}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleMutate(d.id, d.current?.mutations_count || 0)}
                  className="text-xs border border-camp-gold text-camp-gold px-3 py-1 rounded hover:bg-camp-gold/10"
                >
                  editar mutações
                </button>
                <button
                  onClick={() => setExpanded(expanded === d.id ? null : d.id)}
                  className="text-xs border border-camp-border px-3 py-1 rounded text-camp-dim hover:text-camp-bone"
                >
                  {expanded === d.id ? "ocultar histórico" : `histórico (${d.history.length})`}
                </button>
              </div>
            </div>

            {d.current && (
              <div className="grid grid-cols-3 sm:grid-cols-7 gap-2 mt-3 text-center">
                {FIELDS.map(([key, label]) => (
                  <div key={key} className="bg-camp-bg rounded p-2">
                    <p className="text-[10px] text-camp-dim uppercase">{label}</p>
                    <p className="text-camp-bone font-mono text-sm">{(d.current as any)?.[key] ?? "—"}</p>
                  </div>
                ))}
                <div className="bg-camp-bg rounded p-2 col-span-1">
                  <p className="text-[10px] text-camp-dim uppercase">Mut.</p>
                  <p className="text-camp-gold font-mono text-sm">{d.current.mutations_count}</p>
                </div>
              </div>
            )}

            {expanded === d.id && (
              <div className="mt-3 border-t border-camp-border pt-3 space-y-2">
                {d.history.length === 0 && <p className="text-camp-dim text-xs">Sem gerações anteriores.</p>}
                {d.history.map((h) => (
                  <div key={h.id} className="text-xs text-camp-dim flex flex-wrap gap-x-3">
                    <span>{new Date(h.created_at).toLocaleString("pt-BR")}</span>
                    {FIELDS.map(([key, label]) => (
                      <span key={key}>
                        {label}: {(h as any)[key] ?? "—"}
                      </span>
                    ))}
                    <span>Mut: {h.mutations_count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
  required = false
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="text-xs uppercase text-camp-dim tracking-wide">{label}</label>
      <input
        type={type}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        className="w-full mt-1 bg-camp-bg border border-camp-border rounded px-3 py-2 text-camp-bone focus:outline-none focus:border-camp-rust"
      />
    </div>
  );
}
