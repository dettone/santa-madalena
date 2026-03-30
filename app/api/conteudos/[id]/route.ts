import { NextRequest, NextResponse } from "next/server";
import { getContentById, updateContent, deleteContent } from "@/models/content";
import { getSession } from "@/lib/auth";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  const content = await updateContent(id, body);

  if (!content) return NextResponse.json({ error: "Conteúdo não encontrado." }, { status: 404 });
  return NextResponse.json(content);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });

  const { id } = await params;
  const deleted = await deleteContent(id);
  if (!deleted) return NextResponse.json({ error: "Conteúdo não encontrado." }, { status: 404 });
  return NextResponse.json({ message: "Conteúdo excluído." });
}
