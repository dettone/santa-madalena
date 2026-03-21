import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getMemberById, updateMember, deleteMember } from "@/models/member";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });

  const { id } = await params;
  const member = await getMemberById(id);
  if (!member) return NextResponse.json({ error: "Não encontrado." }, { status: 404 });
  return NextResponse.json(member);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  const member = await updateMember(id, body);
  if (!member) return NextResponse.json({ error: "Não encontrado." }, { status: 404 });
  return NextResponse.json(member);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });

  const { id } = await params;
  const deleted = await deleteMember(id);
  if (!deleted) return NextResponse.json({ error: "Não encontrado." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
