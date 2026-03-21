"use client";
import { useState, useEffect } from "react";
import useSWR, { mutate } from "swr";
import AdminSidebar from "@/app/components/AdminSidebar";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

const FORMAS = ["dinheiro", "pix", "cheque", "transferencia", "cartao", "outro"];

type Tithe = {
  id: string;
  nome_contribuinte: string;
  valor: number;
  mes: number;
  ano: number;
  forma_pagamento: string;
  observacao: string | null;
  created_at: string;
};

type Member = { id: string; nome: string };

function formatBRL(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

const EMPTY_FORM = {
  nome_contribuinte: "",
  valor: "",
  mes: String(new Date().getMonth() + 1),
  ano: String(new Date().getFullYear()),
  forma_pagamento: "dinheiro",
  observacao: "",
  member_id: "",
};

export default function DizimoPage() {
  const now = new Date();
  const [filterMes, setFilterMes] = useState(String(now.getMonth() + 1));
  const [filterAno, setFilterAno] = useState(String(now.getFullYear()));
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const url = `/api/dizimo?mes=${filterMes}&ano=${filterAno}`;
  const { data: tithes = [], isLoading } = useSWR<Tithe[]>(url, fetcher);
  const { data: members = [] } = useSWR<Member[]>("/api/membros", fetcher);

  const total = tithes.reduce((s, t) => s + Number(t.valor), 0);

  function openNew() {
    setEditId(null);
    setForm(EMPTY_FORM);
    setErrorMsg("");
    setShowModal(true);
  }

  function openEdit(t: Tithe) {
    setEditId(t.id);
    setForm({
      nome_contribuinte: t.nome_contribuinte,
      valor: String(t.valor),
      mes: String(t.mes),
      ano: String(t.ano),
      forma_pagamento: t.forma_pagamento,
      observacao: t.observacao ?? "",
      member_id: "",
    });
    setErrorMsg("");
    setShowModal(true);
  }

  async function handleSave() {
    if (!form.nome_contribuinte || !form.valor || !form.mes || !form.ano) {
      setErrorMsg("Preencha todos os campos obrigatórios.");
      return;
    }
    setSaving(true);
    setErrorMsg("");

    const payload = {
      nome_contribuinte: form.nome_contribuinte,
      valor: parseFloat(form.valor),
      mes: parseInt(form.mes),
      ano: parseInt(form.ano),
      forma_pagamento: form.forma_pagamento,
      observacao: form.observacao || null,
      member_id: form.member_id || null,
    };

    const res = editId
      ? await fetch(`/api/dizimo/${editId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
      : await fetch("/api/dizimo", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });

    if (res.ok) {
      mutate(url);
      setShowModal(false);
    } else {
      const d = await res.json();
      setErrorMsg(d.error || "Erro ao salvar.");
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Confirma a exclusão deste dízimo?")) return;
    await fetch(`/api/dizimo/${id}`, { method: "DELETE" });
    mutate(url);
  }

  const anos = Array.from({ length: 5 }, (_, i) => now.getFullYear() - i);

  return (
    <div className="flex" style={{ minHeight: "100vh", backgroundColor: "var(--cream)" }}>
      <AdminSidebar />

      <main className="flex-1 p-8 overflow-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="font-bold text-2xl" style={{ fontFamily: "Georgia, serif", color: "var(--burgundy)" }}>
              💰 Gestão de Dízimos
            </h1>
            <p className="text-sm mt-1" style={{ color: "var(--text-muted)", fontFamily: "sans-serif" }}>
              Registre e gerencie as contribuições dos fiéis
            </p>
          </div>
          <button
            onClick={openNew}
            className="px-4 py-2 rounded-lg text-sm font-semibold"
            style={{ backgroundColor: "var(--burgundy)", color: "#fff", fontFamily: "sans-serif" }}
          >
            + Registrar Dízimo
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-6 flex-wrap">
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: "var(--text-muted)", fontFamily: "sans-serif" }}>Mês</label>
            <select
              value={filterMes}
              onChange={(e) => setFilterMes(e.target.value)}
              className="px-3 py-2 rounded-lg text-sm"
              style={{ border: "1.5px solid var(--cream-dark)", backgroundColor: "#fff", fontFamily: "sans-serif" }}
            >
              {MESES.map((m, i) => (
                <option key={i} value={i + 1}>{m}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: "var(--text-muted)", fontFamily: "sans-serif" }}>Ano</label>
            <select
              value={filterAno}
              onChange={(e) => setFilterAno(e.target.value)}
              className="px-3 py-2 rounded-lg text-sm"
              style={{ border: "1.5px solid var(--cream-dark)", backgroundColor: "#fff", fontFamily: "sans-serif" }}
            >
              {anos.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Summary */}
        <div
          className="rounded-xl p-4 mb-6 flex items-center justify-between"
          style={{ backgroundColor: "var(--burgundy)", color: "#fff" }}
        >
          <div>
            <div className="text-xs" style={{ color: "rgba(255,255,255,0.7)", fontFamily: "sans-serif" }}>
              {MESES[parseInt(filterMes) - 1]} de {filterAno}
            </div>
            <div className="font-bold text-xl" style={{ fontFamily: "Georgia, serif" }}>
              Total: {formatBRL(total)}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs" style={{ color: "rgba(255,255,255,0.7)", fontFamily: "sans-serif" }}>Contribuições</div>
            <div className="font-bold text-xl" style={{ fontFamily: "Georgia, serif" }}>{tithes.length}</div>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--cream-dark)", backgroundColor: "#fff" }}>
          {isLoading ? (
            <div className="py-16 text-center text-sm" style={{ color: "var(--text-muted)", fontFamily: "sans-serif" }}>Carregando...</div>
          ) : tithes.length === 0 ? (
            <div className="py-16 text-center">
              <div className="text-3xl mb-2">📋</div>
              <p className="text-sm" style={{ color: "var(--text-muted)", fontFamily: "sans-serif" }}>
                Nenhum dízimo registrado neste período.
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: "var(--cream-dark)" }}>
                  {["Contribuinte", "Valor", "Forma de Pagto", "Observação", "Data", ""].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold" style={{ color: "var(--text-muted)", fontFamily: "sans-serif" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tithes.map((t, i) => (
                  <tr key={t.id} style={{ borderTop: i > 0 ? "1px solid var(--cream-dark)" : undefined }}>
                    <td className="px-4 py-3 font-medium text-sm" style={{ color: "var(--text-dark)", fontFamily: "sans-serif" }}>
                      {t.nome_contribuinte}
                    </td>
                    <td className="px-4 py-3 font-bold text-sm" style={{ color: "var(--burgundy)", fontFamily: "sans-serif" }}>
                      {formatBRL(Number(t.valor))}
                    </td>
                    <td className="px-4 py-3 text-sm" style={{ color: "var(--text-muted)", fontFamily: "sans-serif" }}>
                      <span className="capitalize">{t.forma_pagamento}</span>
                    </td>
                    <td className="px-4 py-3 text-sm" style={{ color: "var(--text-muted)", fontFamily: "sans-serif" }}>
                      {t.observacao || "—"}
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: "var(--text-muted)", fontFamily: "sans-serif" }}>
                      {new Date(t.created_at).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(t)} className="text-xs px-2 py-1 rounded" style={{ backgroundColor: "rgba(201,168,76,0.15)", color: "var(--gold-dark)", fontFamily: "sans-serif" }}>
                          Editar
                        </button>
                        <button onClick={() => handleDelete(t.id)} className="text-xs px-2 py-1 rounded" style={{ backgroundColor: "rgba(220,38,38,0.1)", color: "#dc2626", fontFamily: "sans-serif" }}>
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
              {editId ? "Editar Dízimo" : "Registrar Dízimo"}
            </h2>

            <div className="flex flex-col gap-4">
              {/* Member select */}
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: "var(--text-muted)", fontFamily: "sans-serif" }}>Membro (opcional)</label>
                <select
                  value={form.member_id}
                  onChange={(e) => {
                    const member = members.find((m) => m.id === e.target.value);
                    setForm((f) => ({ ...f, member_id: e.target.value, nome_contribuinte: member ? member.nome : f.nome_contribuinte }));
                  }}
                  className="w-full px-3 py-2.5 rounded-lg text-sm"
                  style={{ border: "1.5px solid var(--cream-dark)", backgroundColor: "var(--cream)", fontFamily: "sans-serif" }}
                >
                  <option value="">— Selecionar membro —</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>{m.nome}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: "var(--text-muted)", fontFamily: "sans-serif" }}>
                  Nome do Contribuinte *
                </label>
                <input
                  type="text"
                  value={form.nome_contribuinte}
                  onChange={(e) => setForm((f) => ({ ...f, nome_contribuinte: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-lg text-sm"
                  style={{ border: "1.5px solid var(--cream-dark)", backgroundColor: "var(--cream)", fontFamily: "sans-serif" }}
                  placeholder="Nome completo"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: "var(--text-muted)", fontFamily: "sans-serif" }}>Valor (R$) *</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.valor}
                    onChange={(e) => setForm((f) => ({ ...f, valor: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-lg text-sm"
                    style={{ border: "1.5px solid var(--cream-dark)", backgroundColor: "var(--cream)", fontFamily: "sans-serif" }}
                    placeholder="0,00"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: "var(--text-muted)", fontFamily: "sans-serif" }}>Forma de Pagto</label>
                  <select
                    value={form.forma_pagamento}
                    onChange={(e) => setForm((f) => ({ ...f, forma_pagamento: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-lg text-sm capitalize"
                    style={{ border: "1.5px solid var(--cream-dark)", backgroundColor: "var(--cream)", fontFamily: "sans-serif" }}
                  >
                    {FORMAS.map((f) => (
                      <option key={f} value={f} className="capitalize">{f}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: "var(--text-muted)", fontFamily: "sans-serif" }}>Mês *</label>
                  <select
                    value={form.mes}
                    onChange={(e) => setForm((f) => ({ ...f, mes: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-lg text-sm"
                    style={{ border: "1.5px solid var(--cream-dark)", backgroundColor: "var(--cream)", fontFamily: "sans-serif" }}
                  >
                    {MESES.map((m, i) => (
                      <option key={i} value={i + 1}>{m}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: "var(--text-muted)", fontFamily: "sans-serif" }}>Ano *</label>
                  <select
                    value={form.ano}
                    onChange={(e) => setForm((f) => ({ ...f, ano: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-lg text-sm"
                    style={{ border: "1.5px solid var(--cream-dark)", backgroundColor: "var(--cream)", fontFamily: "sans-serif" }}
                  >
                    {Array.from({ length: 5 }, (_, i) => now.getFullYear() - i).map((a) => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: "var(--text-muted)", fontFamily: "sans-serif" }}>Observação</label>
                <textarea
                  value={form.observacao}
                  onChange={(e) => setForm((f) => ({ ...f, observacao: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2.5 rounded-lg text-sm resize-none"
                  style={{ border: "1.5px solid var(--cream-dark)", backgroundColor: "var(--cream)", fontFamily: "sans-serif" }}
                  placeholder="Observações adicionais..."
                />
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
