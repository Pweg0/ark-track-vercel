"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password })
    });
    setLoading(false);
    if (res.ok) {
      router.push("/");
      router.refresh();
    } else {
      setError("Senha incorreta.");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-camp-panel border border-camp-border rounded-lg p-8 w-full max-w-sm"
      >
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-camp-rust text-xl">◆</span>
          <h1 className="font-display text-3xl text-camp-bone tracking-wide">REGISTRO DA TRIBO</h1>
        </div>
        <p className="text-camp-dim text-xs mb-6">acesso restrito à tribo</p>

        <label className="text-xs uppercase text-camp-dim tracking-wide">Senha da tribo</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mt-1 mb-4 bg-camp-bg border border-camp-border rounded px-3 py-2 text-camp-bone focus:outline-none focus:border-camp-rust"
          autoFocus
        />

        {error && <p className="text-camp-alert text-sm mb-3">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-camp-rust hover:bg-camp-rustdark transition-colors text-camp-bone font-display text-xl tracking-wide py-2 rounded disabled:opacity-50"
        >
          {loading ? "ENTRANDO..." : "ENTRAR NO CAMPO"}
        </button>
      </form>
    </div>
  );
}
