import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { listTithes, createTithe } from "@/models/tithe";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const mes = searchParams.get("mes") ? parseInt(searchParams.get("mes")!) : undefined;
  const ano = searchParams.get("ano") ? parseInt(searchParams.get("ano")!) : undefined;

  const tithes = await listTithes(mes, ano);
  return NextResponse.json(tithes);
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });

  const body = await request.json();
  if (!body.nome_contribuinte || !body.valor || !body.mes || !body.ano) {
    return NextResponse.json(
      { error: "Nome, valor, mês e ano são obrigatórios." },
      { status: 400 },
    );
  }

  const tithe = await createTithe({
    member_id: body.member_id ?? null,
    nome_contribuinte: body.nome_contribuinte,
    valor: parseFloat(body.valor),
    mes: parseInt(body.mes),
    ano: parseInt(body.ano),
    forma_pagamento: body.forma_pagamento ?? "dinheiro",
    observacao: body.observacao ?? null,
  });

  return NextResponse.json(tithe, { status: 201 });
}
