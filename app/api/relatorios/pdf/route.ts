import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { generatePDF } from "@/lib/reports";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });

  const mes = parseInt(request.nextUrl.searchParams.get("mes") || String(new Date().getMonth() + 1));
  const ano = parseInt(request.nextUrl.searchParams.get("ano") || String(new Date().getFullYear()));

  if (mes < 1 || mes > 12 || ano < 2000) {
    return NextResponse.json({ error: "Mês ou ano inválido." }, { status: 400 });
  }

  const MESES = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

  const pdf = await generatePDF(mes, ano);

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="relatorio-dizimo-${MESES[mes - 1]}-${ano}.pdf"`,
    },
  });
}
