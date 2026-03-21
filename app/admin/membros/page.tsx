"use client";
import { useState } from "react";
import useSWR, { mutate } from "swr";
import AdminSidebar from "@/app/components/AdminSidebar";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

type Member = {
  id: string;
  nome: string;
  email: string | null;
  telefone: string | null;
  endereco: string | null;
  ativo: boolean;
  created_at: string;
};

const EMPTY_FORM = { nome: "", email: "", telefone: "", endereco: "", ativo: true };

export default function MembrosPage() {
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [search, setSearch] = useState("");

  const { data: members = [], isLoading } = useSWR<Member[]>("/api/membros", fetcher);

  const filtered = members.filter(
    (m) =>
      m.nome.toLowerCase().includes(search.toLowerCase()) ||
      (m.email ?? "").toLowerCase().includes(search.toLowerCase()),
  );

  function openNew() {
    setEditId(null);
    setForm(EMPTY_FORM);
    setErrorMsg("");
    setShowModal(true);
  }

  function openEdit(m: Member) {
    setEditId(m.id);
    setForm({
      nome: m.nome,
      email: m.email ?? "",
      telefone: m.telefone ?? "",
      endereco: m.endereco ?? "",
      ativo: m.ativo,
    });
    setErrorMsg("");
    setShowModal(true);
  }

  async function handleSave() {
    if (!form.nome.trim()) {
      setErrorMsg("O nome é obrigatório.");
      return;
    }
    setSaving(true);
    setErrorMsg("");

    const payload = {
      nome: form.nome,
      email: form.email || null,
      telefone: form.telefone || null,
      endereco: form.endereco || null,
      ativo: form.ativo,
    };

    const res = editId
      ? await fetch(`/api/membros/${editId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
      : await fetch("/api/membros", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });

    if (res.ok) {
      mutate("/api/membros");
      setShowModal(false);
    } else {
      const d = await res.json();
      setErrorMsg(d.error || "Erro ao salvar.");
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Confirma a exclusão deste membro?")) return;
    await fetch(`/api/membros/${id}`, { method: "DELETE" });
    mutate("/api/membros");
  }

  return (
    <div className="flex" style={{ minHeight: "100vh", backgroundColor: "var(--cream)" }}>
      <AdminSidebar />

      <main className="flex-1 p-8 overflow-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="font-bold text-2xl" style={{ fontFamily: "Georgia, serif", color: "var(--burgundy)" }}>
              👥 Membros da Comunidade
            </h1>
            <p className="text-sm mt-1" style={{ color: "var(--text-muted)", fontFamily: "sans-serif" }}>
              Gerencie os fiéis cadastrados na comunidade
            </p>
          </div>
          <button
            onClick={openNew}
            className="px-4 py-2 rounded-lg text-sm font-semibold"
            style={{ backgroundColor: "var(--burgundy)", color: "#fff", fontFamily: "sans-serif" }}
          >
            + Novo Membro
          </button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="🔍  Buscar por nome ou e-mail..."
            className="w-full max-w-sm px-4 py-2.5 rounded-lg text-sm"
            style={{ border: "1.5px solid var(--cream-dark)", backgroundColor: "#fff", fontFamily: "sans-serif" }}
          />
        </div>

        {/* Stats bar */}
        <div className="flex gap-4 mb-6 flex-wrap">
          <div className="px-4 py-2 rounded-lg text-sm" style={{ backgroundColor: "#fff", border: "1px solid var(--cream-dark)", fontFamily: "sans-serif" }}>
            <span style={{ color: "var(--text-muted)" }}>Total: </span>
            <strong style={{ color: "var(--burgundy)" }}>{members.length}</strong>
          </div>
          <div className="px-4 py-2 rounded-lg text-sm" style={{ backgroundColor: "#fff", border: "1px solid var(--cream-dark)", fontFamily: "sans-serif" }}>
            <span style={{ color: "var(--text-muted)" }}>Ativos: </span>
            <strong style={{ color: "#16a34a" }}>{members.filter((m) => m.ativo).length}</strong>
          </div>
          <div className="px-4 py-2 rounded-lg text-sm" style={{ backgroundColor: "#fff", border: "1px solid var(--cream-dark)", fontFamily: "sans-serif" }}>
            <span style={{ color: "var(--text-muted)" }}>Inativos: </span>
            <strong style={{ color: "#dc2626" }}>{members.filter((m) => !m.ativo).length}</strong>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--cream-dark)", backgroundColor: "#fff" }}>
          {isLoading ? (
            <div className="py-16 text-center text-sm" style={{ color: "var(--text-muted)", fontFamily: "sans-serif" }}>Carregando...</div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center">
              <div className="text-3xl mb-2">👥</div>
              <p className="text-sm" style={{ color: "var(--text-muted)", fontFamily: "sans-serif" }}>
                {search ? "Nenhum membro encontrado." : "Nenhum membro cadastrado ainda."}
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: "var(--cream-dark)" }}>
                  {["Nome", "E-mail", "Telefone", "Status", "Cadastrado em", ""].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold" style={{ color: "var(--text-muted)", fontFamily: "sans-serif" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((m, i) => (
                  <tr key={m.id} style={{ borderTop: i > 0 ? "1px solid var(--cream-dark)" : undefined }}>
                    <td className="px-4 py-3 font-medium text-sm" style={{ color: "var(--text-dark)", fontFamily: "sans-serif" }}>
                      {m.nome}
                    </td>
                    <td className="px-4 py-3 text-sm" style={{ color: "var(--text-muted)", fontFamily: "sans-serif" }}>
                      {m.email || "—"}
                    </td>
                    <td className="px-4 py-3 text-sm" style={{ color: "var(--text-muted)", fontFamily: "sans-serif" }}>
                      {m.telefone || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-semibold"
                        style={{
                          backgroundColor: m.ativo ? "rgba(22,163,74,0.1)" : "rgba(220,38,38,0.1)",
                          color: m.ativo ? "#16a34a" : "#dc2626",
                          fontFamily: "sans-serif",
                        }}
                      >
                        {m.ativo ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: "var(--text-muted)", fontFamily: "sans-serif" }}>
                      {new Date(m.created_at).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(m)} className="text-xs px-2 py-1 rounded" style={{ backgroundColor: "rgba(201,168,76,0.15)", color: "var(--gold-dark)", fontFamily: "sans-serif" }}>
                          Editar
                        </button>
                        <button onClick={() => handleDelete(m.id)} className="text-xs px-2 py-1 rounded" style={{ backgroundColor: "rgba(220,38,38,0.1)", color: "#dc2626", fontFamily: "sans-serif" }}>
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="w-full max-w-md rounded-2xl p-8 mx-4" style={{ backgroundColor: "#fff", maxHeight: "90vh", overflowY: "auto" }}>
            <h2 className="font-bold text-lg mb-6" style={{ fontFamily: "Georgia, serif", color: "var(--burgundy)" }}>
              {editId ? "Editar Membro" : "Novo Membro"}
            </h2>

            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: "var(--text-muted)", fontFamily: "sans-serif" }}>Nome *</label>
                <input
                  type="text"
                  value={form.nome}
                  onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-lg text-sm"
                  style={{ border: "1.5px solid var(--cream-dark)", backgroundColor: "var(--cream)", fontFamily: "sans-serif" }}
                  placeholder="Nome completo"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: "var(--text-muted)", fontFamily: "sans-serif" }}>E-mail</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-lg text-sm"
                  style={{ border: "1.5px solid var(--cream-dark)", backgroundColor: "var(--cream)", fontFamily: "sans-serif" }}
                  placeholder="email@exemplo.com"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: "var(--text-muted)", fontFamily: "sans-serif" }}>Telefone</label>
                <input
                  type="text"
                  value={form.telefone}
                  onChange={(e) => setForm((f) => ({ ...f, telefone: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-lg text-sm"
                  style={{ border: "1.5px solid var(--cream-dark)", backgroundColor: "var(--cream)", fontFamily: "sans-serif" }}
                  placeholder="(00) 00000-0000"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: "var(--text-muted)", fontFamily: "sans-serif" }}>Endereço</label>
                <input
                  type="text"
                  value={form.endereco}
                  onChange={(e) => setForm((f) => ({ ...f, endereco: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-lg text-sm"
                  style={{ border: "1.5px solid var(--cream-dark)", backgroundColor: "var(--cream)", fontFamily: "sans-serif" }}
                  placeholder="Rua, número, bairro..."
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="ativo"
                  checked={form.ativo}
                  onChange={(e) => setForm((f) => ({ ...f, ativo: e.target.checked }))}
                  className="w-4 h-4"
                  style={{ accentColor: "var(--burgundy)" }}
                />
                <label htmlFor="ativo" className="text-sm" style={{ color: "var(--text-dark)", fontFamily: "sans-serif" }}>
                  Membro ativo
                </label>
              </div>

              {errorMsg && (
                <div className="text-xs py-2 px-3 rounded-lg" style={{ backgroundColor: "#fee2e2", color: "#dc2626", fontFamily: "sans-serif" }}>
                  {errorMsg}
                </div>
              )}

              <div className="flex gap-3 mt-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-lg text-sm font-semibold"
                  style={{ backgroundColor: "var(--cream-dark)", color: "var(--text-muted)", fontFamily: "sans-serif" }}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-lg text-sm font-semibold"
                  style={{ backgroundColor: "var(--burgundy)", color: "#fff", fontFamily: "sans-serif" }}
                >
                  {saving ? "Salvando..." : "Salvar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
