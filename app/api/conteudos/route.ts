import { NextRequest, NextResponse } from "next/server";
import { listPublicContents, listAllContents, createContent } from "@/models/content";
import { getSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const admin = request.nextUrl.searchParams.get("admin");

  if (admin === "true") {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    const contents = await listAllContents();
    return NextResponse.json(contents);
  }

  const contents = await listPublicContents();
  return NextResponse.json(contents);
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });

  const body = await request.json();
  const { tipo, titulo, corpo, imagem_url, publicado, data_publicacao } = body;

  if (!tipo || !titulo || !corpo || !data_publicacao) {
    return NextResponse.json({ error: "Campos obrigatórios: tipo, titulo, corpo, data_publicacao." }, { status: 400 });
  }

  if (!["aviso", "reflexao", "evento"].includes(tipo)) {
    return NextResponse.json({ error: "Tipo deve ser: aviso, reflexao ou evento." }, { status: 400 });
  }

  const content = await createContent({
    tipo,
    titulo,
    corpo,
    imagem_url: imagem_url || null,
    publicado: publicado ?? false,
    data_publicacao,
  });

  return NextResponse.json(content, { status: 201 });
}
