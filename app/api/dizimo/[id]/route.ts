import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getTitheById, updateTithe, deleteTithe } from "@/models/tithe";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });

  const { id } = await params;
  const tithe = await getTitheById(id);
  if (!tithe) return NextResponse.json({ error: "Não encontrado." }, { status: 404 });
  return NextResponse.json(tithe);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  const tithe = await updateTithe(id, body);
  if (!tithe) return NextResponse.json({ error: "Não encontrado." }, { status: 404 });
  return NextResponse.json(tithe);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });

  const { id } = await params;
  const deleted = await deleteTithe(id);
  if (!deleted) return NextResponse.json({ error: "Não encontrado." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
