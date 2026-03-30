"use client";
import { useState } from "react";
import useSWR, { mutate } from "swr";
import AdminSidebar from "@/app/components/AdminSidebar";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const TIPOS = [
  { value: "aviso", label: "Aviso" },
  { value: "reflexao", label: "Reflexão" },
  { value: "evento", label: "Evento" },
];

const TIPO_COLORS: Record<string, { bg: string; color: string }> = {
  aviso: { bg: "rgba(201,168,76,0.15)", color: "var(--gold-dark)" },
  reflexao: { bg: "rgba(107,26,42,0.1)", color: "var(--burgundy)" },
  evento: { bg: "rgba(22,163,74,0.1)", color: "#16a34a" },
};

type Content = {
  id: string;
  tipo: string;
  titulo: string;
  corpo: string;
  imagem_url: string | null;
  publicado: boolean;
  data_publicacao: string;
  created_at: string;
};

const EMPTY_FORM = {
  tipo: "aviso",
  titulo: "",
  corpo: "",
  imagem_url: "",
  publicado: true,
  data_publicacao: new Date().toISOString().split("T")[0],
};

export default function ConteudosPage() {
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [filterTipo, setFilterTipo] = useState("todos");

  const apiUrl = "/api/conteudos?admin=true";
  const { data: contents = [], isLoading } = useSWR<Content[]>(apiUrl, fetcher);

  const filtered = filterTipo === "todos" ? contents : contents.filter((c) => c.tipo === filterTipo);

  function openNew() {
    setEditId(null);
    setForm(EMPTY_FORM);
    setErrorMsg("");
    setShowModal(true);
  }

  function openEdit(c: Content) {
    setEditId(c.id);
    setForm({
      tipo: c.tipo,
      titulo: c.titulo,
      corpo: c.corpo,
      imagem_url: c.imagem_url ?? "",
      publicado: c.publicado,
      data_publicacao: c.data_publicacao.split("T")[0],
    });
    setErrorMsg("");
    setShowModal(true);
  }

  async function handleSave() {
    if (!form.titulo || !form.corpo || !form.data_publicacao) {
      setErrorMsg("Preencha título, corpo e data de publicação.");
      return;
    }
    setSaving(true);
    setErrorMsg("");

    const payload = {
      tipo: form.tipo,
      titulo: form.titulo,
      corpo: form.corpo,
      imagem_url: form.imagem_url || null,
      publicado: form.publicado,
      data_publicacao: form.data_publicacao,
    };

    const res = editId
      ? await fetch(`/api/conteudos/${editId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
      : await fetch("/api/conteudos", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });

    if (res.ok) {
      mutate(apiUrl);
      setShowModal(false);
    } else {
      const d = await res.json();
      setErrorMsg(d.error || "Erro ao salvar.");
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Confirma a exclusão deste conteúdo?")) return;
    await fetch(`/api/conteudos/${id}`, { method: "DELETE" });
    mutate(apiUrl);
  }

  async function togglePublicado(c: Content) {
    await fetch(`/api/conteudos/${c.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ publicado: !c.publicado }),
    });
    mutate(apiUrl);
  }

  return (
    <div className="flex" style={{ minHeight: "100vh", backgroundColor: "var(--cream)" }}>
      <AdminSidebar />

      <main className="flex-1 p-8 overflow-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="font-bold text-2xl" style={{ fontFamily: "Georgia, serif", color: "var(--burgundy)" }}>
              Conteúdos Diários
            </h1>
            <p className="text-sm mt-1" style={{ color: "var(--text-muted)", fontFamily: "sans-serif" }}>
              Gerencie avisos, reflexões e eventos exibidos na página pública
            </p>
          </div>
          <button
            onClick={openNew}
            className="px-4 py-2 rounded-lg text-sm font-semibold"
            style={{ backgroundColor: "var(--burgundy)", color: "#fff", fontFamily: "sans-serif" }}
          >
            + Novo Conteúdo
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          {[{ value: "todos", label: "Todos" }, ...TIPOS].map((t) => (
            <button
              key={t.value}
              onClick={() => setFilterTipo(t.value)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={{
                backgroundColor: filterTipo === t.value ? "var(--burgundy)" : "var(--cream-dark)",
                color: filterTipo === t.value ? "#fff" : "var(--text-muted)",
                fontFamily: "sans-serif",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="rounded-xl p-4" style={{ backgroundColor: "#fff", border: "1px solid var(--cream-dark)" }}>
            <div className="text-xs mb-1" style={{ color: "var(--text-muted)", fontFamily: "sans-serif" }}>Total</div>
            <div className="font-bold text-xl" style={{ fontFamily: "Georgia, serif", color: "var(--burgundy)" }}>{contents.length}</div>
          </div>
          <div className="rounded-xl p-4" style={{ backgroundColor: "#fff", border: "1px solid var(--cream-dark)" }}>
            <div className="text-xs mb-1" style={{ color: "var(--text-muted)", fontFamily: "sans-serif" }}>Publicados</div>
            <div className="font-bold text-xl" style={{ fontFamily: "Georgia, serif", color: "#16a34a" }}>{contents.filter((c) => c.publicado).length}</div>
          </div>
          <div className="rounded-xl p-4" style={{ backgroundColor: "#fff", border: "1px solid var(--cream-dark)" }}>
            <div className="text-xs mb-1" style={{ color: "var(--text-muted)", fontFamily: "sans-serif" }}>Rascunhos</div>
            <div className="font-bold text-xl" style={{ fontFamily: "Georgia, serif", color: "var(--gold-dark)" }}>{contents.filter((c) => !c.publicado).length}</div>
          </div>
          <div className="rounded-xl p-4" style={{ backgroundColor: "#fff", border: "1px solid var(--cream-dark)" }}>
            <div className="text-xs mb-1" style={{ color: "var(--text-muted)", fontFamily: "sans-serif" }}>Eventos</div>
            <div className="font-bold text-xl" style={{ fontFamily: "Georgia, serif", color: "var(--burgundy)" }}>{contents.filter((c) => c.tipo === "evento").length}</div>
          </div>
        </div>

        {/* Cards grid */}
        {isLoading ? (
          <div className="py-16 text-center text-sm" style={{ color: "var(--text-muted)", fontFamily: "sans-serif" }}>Carregando...</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <div className="text-3xl mb-2">📝</div>
            <p className="text-sm" style={{ color: "var(--text-muted)", fontFamily: "sans-serif" }}>
              Nenhum conteúdo encontrado.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((c) => {
              const tipoCfg = TIPO_COLORS[c.tipo] || TIPO_COLORS.aviso;
              return (
                <div
                  key={c.id}
                  className="rounded-xl p-5 flex flex-col gap-3"
                  style={{ backgroundColor: "#fff", border: "1px solid var(--cream-dark)" }}
                >
                  {/* Type + status badges */}
                  <div className="flex items-center gap-2">
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded capitalize"
                      style={{ backgroundColor: tipoCfg.bg, color: tipoCfg.color, fontFamily: "sans-serif" }}
                    >
                      {c.tipo === "reflexao" ? "Reflexão" : c.tipo}
                    </span>
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded"
                      style={{
                        backgroundColor: c.publicado ? "rgba(22,163,74,0.1)" : "rgba(107,26,42,0.1)",
                        color: c.publicado ? "#16a34a" : "var(--text-muted)",
                        fontFamily: "sans-serif",
                      }}
                    >
                      {c.publicado ? "Publicado" : "Rascunho"}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm" style={{ fontFamily: "Georgia, serif", color: "var(--burgundy)" }}>
                    {c.titulo}
                  </h3>

                  <p className="text-xs line-clamp-3" style={{ color: "var(--text-muted)", fontFamily: "sans-serif", lineHeight: 1.6 }}>
                    {c.corpo}
                  </p>

                  <div className="text-xs" style={{ color: "var(--text-muted)", fontFamily: "sans-serif" }}>
                    Data: {new Date(c.data_publicacao).toLocaleDateString("pt-BR")}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-auto pt-2" style={{ borderTop: "1px solid var(--cream-dark)" }}>
                    <button
                      onClick={() => togglePublicado(c)}
                      className="text-xs px-2 py-1 rounded"
                      style={{
                        backgroundColor: c.publicado ? "rgba(220,38,38,0.1)" : "rgba(22,163,74,0.1)",
                        color: c.publicado ? "#dc2626" : "#16a34a",
                        fontFamily: "sans-serif",
                      }}
                    >
                      {c.publicado ? "Despublicar" : "Publicar"}
                    </button>
                    <button onClick={() => openEdit(c)} className="text-xs px-2 py-1 rounded" style={{ backgroundColor: "rgba(201,168,76,0.15)", color: "var(--gold-dark)", fontFamily: "sans-serif" }}>
                      Editar
                    </button>
                    <button onClick={() => handleDelete(c.id)} className="text-xs px-2 py-1 rounded" style={{ backgroundColor: "rgba(220,38,38,0.1)", color: "#dc2626", fontFamily: "sans-serif" }}>
                      Excluir
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="w-full max-w-lg rounded-2xl p-8 mx-4" style={{ backgroundColor: "#fff", maxHeight: "90vh", overflowY: "auto" }}>
            <h2 className="font-bold text-lg mb-6" style={{ fontFamily: "Georgia, serif", color: "var(--burgundy)" }}>
              {editId ? "Editar Conteúdo" : "Novo Conteúdo"}
            </h2>

            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: "var(--text-muted)", fontFamily: "sans-serif" }}>Tipo *</label>
                  <select
                    value={form.tipo}
                    onChange={(e) => setForm((f) => ({ ...f, tipo: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-lg text-sm"
                    style={{ border: "1.5px solid var(--cream-dark)", backgroundColor: "var(--cream)", fontFamily: "sans-serif" }}
                  >
                    {TIPOS.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: "var(--text-muted)", fontFamily: "sans-serif" }}>Data de Publicação *</label>
                  <input
                    type="date"
                    value={form.data_publicacao}
                    onChange={(e) => setForm((f) => ({ ...f, data_publicacao: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-lg text-sm"
                    style={{ border: "1.5px solid var(--cream-dark)", backgroundColor: "var(--cream)", fontFamily: "sans-serif" }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: "var(--text-muted)", fontFamily: "sans-serif" }}>Título *</label>
                <input
                  type="text"
                  value={form.titulo}
                  onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-lg text-sm"
                  style={{ border: "1.5px solid var(--cream-dark)", backgroundColor: "var(--cream)", fontFamily: "sans-serif" }}
                  placeholder="Título do conteúdo"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: "var(--text-muted)", fontFamily: "sans-serif" }}>Corpo *</label>
                <textarea
                  value={form.corpo}
                  onChange={(e) => setForm((f) => ({ ...f, corpo: e.target.value }))}
                  rows={6}
                  className="w-full px-3 py-2.5 rounded-lg text-sm resize-none"
                  style={{ border: "1.5px solid var(--cream-dark)", backgroundColor: "var(--cream)", fontFamily: "sans-serif" }}
                  placeholder="Texto do aviso, reflexão ou descrição do evento..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: "var(--text-muted)", fontFamily: "sans-serif" }}>URL da Imagem (opcional)</label>
                <input
                  type="text"
                  value={form.imagem_url}
                  onChange={(e) => setForm((f) => ({ ...f, imagem_url: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-lg text-sm"
                  style={{ border: "1.5px solid var(--cream-dark)", backgroundColor: "var(--cream)", fontFamily: "sans-serif" }}
                  placeholder="/images/minha-imagem.jpg ou URL externa"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="publicado"
                  checked={form.publicado}
                  onChange={(e) => setForm((f) => ({ ...f, publicado: e.target.checked }))}
                  className="rounded"
                />
                <label htmlFor="publicado" className="text-sm" style={{ color: "var(--text-dark)", fontFamily: "sans-serif" }}>
                  Publicar imediatamente
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
