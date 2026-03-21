"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (res.ok) {
      router.push("/admin/dashboard");
    } else {
      const data = await res.json();
      setError(data.error || "Erro ao entrar.");
    }
    setLoading(false);
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: "linear-gradient(135deg, var(--burgundy-dark) 0%, var(--burgundy) 60%, #3a0a1a 100%)" }}
    >
      <div
        className="w-full max-w-sm rounded-2xl p-8"
        style={{ backgroundColor: "#fff", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div style={{ fontSize: "3rem", color: "var(--gold)" }}>✠</div>
          <h1 className="font-bold text-xl mt-2" style={{ fontFamily: "Georgia, serif", color: "var(--burgundy)" }}>
            Santa Madalena
          </h1>
          <p className="text-xs mt-1" style={{ color: "var(--text-muted)", fontFamily: "sans-serif" }}>
            Área Administrativa
          </p>
        </div>

        <hr className="gold-divider" />

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-6">
          <div>
            <label
              htmlFor="username"
              className="block text-xs font-semibold mb-1"
              style={{ color: "var(--text-muted)", fontFamily: "sans-serif" }}
            >
              Usuário
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
              style={{
                border: "1.5px solid var(--cream-dark)",
                backgroundColor: "var(--cream)",
                fontFamily: "sans-serif",
                color: "var(--text-dark)",
              }}
              placeholder="admin"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-xs font-semibold mb-1"
              style={{ color: "var(--text-muted)", fontFamily: "sans-serif" }}
            >
              Senha
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
              style={{
                border: "1.5px solid var(--cream-dark)",
                backgroundColor: "var(--cream)",
                fontFamily: "sans-serif",
                color: "var(--text-dark)",
              }}
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div
              className="text-xs text-center py-2 px-3 rounded-lg"
              style={{ backgroundColor: "#fee2e2", color: "#dc2626", fontFamily: "sans-serif" }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg font-semibold text-sm transition-all mt-2"
            style={{
              backgroundColor: loading ? "var(--text-muted)" : "var(--burgundy)",
              color: "#fff",
              fontFamily: "sans-serif",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <div className="text-center mt-6">
          <a href="/" className="text-xs" style={{ color: "var(--text-muted)", fontFamily: "sans-serif" }}>
            ← Voltar ao site público
          </a>
        </div>
      </div>
    </div>
  );
}
