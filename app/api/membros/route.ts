import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { listMembers, createMember } from "@/models/member";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });

  const members = await listMembers();
  return NextResponse.json(members);
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });

  const body = await request.json();
  if (!body.nome) {
    return NextResponse.json({ error: "Nome é obrigatório." }, { status: 400 });
  }

  const member = await createMember({
    nome: body.nome,
    email: body.email ?? null,
    telefone: body.telefone ?? null,
    endereco: body.endereco ?? null,
    ativo: body.ativo ?? true,
  });

  return NextResponse.json(member, { status: 201 });
}
