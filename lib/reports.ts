import PDFDocument from "pdfkit";
import ExcelJS from "exceljs";
import { listTithes, type Tithe } from "@/models/tithe";
import { listMembers, type Member } from "@/models/member";

const MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

function formatBRL(value: number) {
  return `R$ ${Number(value).toFixed(2).replace(".", ",")}`;
}

export async function generatePDF(mes: number, ano: number): Promise<Buffer> {
  const [tithes, members] = await Promise.all([
    listTithes(mes, ano),
    listMembers(),
  ]);

  const total = tithes.reduce((s, t) => s + Number(t.valor), 0);
  const activeMembers = members.filter((m) => m.ativo);

  // Group by payment method
  const byMethod: Record<string, { count: number; total: number }> = {};
  for (const t of tithes) {
    if (!byMethod[t.forma_pagamento]) byMethod[t.forma_pagamento] = { count: 0, total: 0 };
    byMethod[t.forma_pagamento].count++;
    byMethod[t.forma_pagamento].total += Number(t.valor);
  }

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    // Header
    doc.fontSize(20).font("Helvetica-Bold").fillColor("#800020")
      .text("Comunidade Santa Maria Madalena", { align: "center" });
    doc.moveDown(0.3);
    doc.fontSize(14).font("Helvetica").fillColor("#333")
      .text(`Relatório de Dízimos — ${MESES[mes - 1]} de ${ano}`, { align: "center" });
    doc.moveDown(0.5);

    // Divider
    doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor("#C9A84C").lineWidth(2).stroke();
    doc.moveDown(1);

    // Summary box
    doc.fontSize(12).font("Helvetica-Bold").fillColor("#800020").text("Resumo Geral");
    doc.moveDown(0.3);
    doc.fontSize(10).font("Helvetica").fillColor("#333");
    doc.text(`Total arrecadado: ${formatBRL(total)}`);
    doc.text(`Contribuições no mês: ${tithes.length}`);
    doc.text(`Membros ativos: ${activeMembers.length}`);
    doc.text(`Membros cadastrados: ${members.length}`);
    doc.moveDown(1);

    // By payment method
    doc.fontSize(12).font("Helvetica-Bold").fillColor("#800020").text("Por Forma de Pagamento");
    doc.moveDown(0.3);
    doc.fontSize(10).font("Helvetica").fillColor("#333");
    for (const [method, data] of Object.entries(byMethod)) {
      doc.text(`  ${method}: ${data.count} contribuições — ${formatBRL(data.total)}`);
    }
    doc.moveDown(1);

    // Divider
    doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor("#C9A84C").lineWidth(1).stroke();
    doc.moveDown(0.5);

    // Tithes table
    doc.fontSize(12).font("Helvetica-Bold").fillColor("#800020").text("Detalhamento");
    doc.moveDown(0.5);

    // Table header
    const startX = 50;
    let y = doc.y;
    doc.fontSize(9).font("Helvetica-Bold").fillColor("#4a0012");
    doc.text("Contribuinte", startX, y, { width: 180 });
    doc.text("Valor", startX + 180, y, { width: 80 });
    doc.text("Forma Pagto", startX + 260, y, { width: 100 });
    doc.text("Data", startX + 370, y, { width: 80 });
    y += 15;

    doc.moveTo(startX, y).lineTo(545, y).strokeColor("#ccc").lineWidth(0.5).stroke();
    y += 5;

    doc.font("Helvetica").fillColor("#333").fontSize(9);
    for (const t of tithes) {
      if (y > 750) {
        doc.addPage();
        y = 50;
      }
      doc.text(t.nome_contribuinte, startX, y, { width: 180 });
      doc.text(formatBRL(Number(t.valor)), startX + 180, y, { width: 80 });
      doc.text(t.forma_pagamento, startX + 260, y, { width: 100 });
      doc.text(new Date(t.created_at).toLocaleDateString("pt-BR"), startX + 370, y, { width: 80 });
      y += 14;
    }

    // Footer
    doc.moveDown(2);
    doc.fontSize(8).fillColor("#999")
      .text(`Gerado em ${new Date().toLocaleString("pt-BR")} — Sistema Santa Madalena`, { align: "center" });

    doc.end();
  });
}

export async function generateExcel(mes: number, ano: number): Promise<Buffer> {
  const [tithes, members] = await Promise.all([
    listTithes(mes, ano),
    listMembers(),
  ]);

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Sistema Santa Madalena";

  // Sheet 1 — Dízimos
  const sheetDizimos = workbook.addWorksheet("Dízimos");
  sheetDizimos.columns = [
    { header: "Contribuinte", key: "nome", width: 30 },
    { header: "Valor (R$)", key: "valor", width: 15 },
    { header: "Forma de Pagamento", key: "forma", width: 20 },
    { header: "Observação", key: "obs", width: 30 },
    { header: "Data", key: "data", width: 15 },
  ];

  // Style header
  const headerRow = sheetDizimos.getRow(1);
  headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
  headerRow.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF800020" } };

  for (const t of tithes) {
    sheetDizimos.addRow({
      nome: t.nome_contribuinte,
      valor: Number(t.valor),
      forma: t.forma_pagamento,
      obs: t.observacao || "",
      data: new Date(t.created_at).toLocaleDateString("pt-BR"),
    });
  }

  // Total row
  const totalRow = sheetDizimos.addRow({
    nome: "TOTAL",
    valor: tithes.reduce((s, t) => s + Number(t.valor), 0),
    forma: "",
    obs: "",
    data: "",
  });
  totalRow.font = { bold: true };

  // Format valor column as currency
  sheetDizimos.getColumn("valor").numFmt = '#,##0.00';

  // Sheet 2 — Membros
  const sheetMembros = workbook.addWorksheet("Membros");
  sheetMembros.columns = [
    { header: "Nome", key: "nome", width: 30 },
    { header: "E-mail", key: "email", width: 30 },
    { header: "Telefone", key: "telefone", width: 18 },
    { header: "Endereço", key: "endereco", width: 35 },
    { header: "Status", key: "status", width: 12 },
  ];

  const headerRow2 = sheetMembros.getRow(1);
  headerRow2.font = { bold: true, color: { argb: "FFFFFFFF" } };
  headerRow2.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF800020" } };

  for (const m of members) {
    sheetMembros.addRow({
      nome: m.nome,
      email: m.email || "",
      telefone: m.telefone || "",
      endereco: m.endereco || "",
      status: m.ativo ? "Ativo" : "Inativo",
    });
  }

  // Sheet 3 — Resumo
  const sheetResumo = workbook.addWorksheet("Resumo");
  sheetResumo.columns = [
    { header: "Indicador", key: "indicador", width: 35 },
    { header: "Valor", key: "valor", width: 20 },
  ];

  const headerRow3 = sheetResumo.getRow(1);
  headerRow3.font = { bold: true, color: { argb: "FFFFFFFF" } };
  headerRow3.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF800020" } };

  sheetResumo.addRow({ indicador: `Período`, valor: `${MESES[mes - 1]} de ${ano}` });
  sheetResumo.addRow({ indicador: "Total arrecadado", valor: tithes.reduce((s, t) => s + Number(t.valor), 0) });
  sheetResumo.addRow({ indicador: "Contribuições no mês", valor: tithes.length });
  sheetResumo.addRow({ indicador: "Membros ativos", valor: members.filter((m) => m.ativo).length });
  sheetResumo.addRow({ indicador: "Membros cadastrados", valor: members.length });

  // Group by payment method
  const byMethod: Record<string, number> = {};
  for (const t of tithes) {
    byMethod[t.forma_pagamento] = (byMethod[t.forma_pagamento] || 0) + Number(t.valor);
  }
  sheetResumo.addRow({ indicador: "", valor: "" });
  sheetResumo.addRow({ indicador: "--- Por Forma de Pagamento ---", valor: "" });
  for (const [method, total] of Object.entries(byMethod)) {
    sheetResumo.addRow({ indicador: method, valor: total });
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
