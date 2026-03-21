import { NextRequest, NextResponse } from "next/server";
import { validateAdminPassword } from "@/models/adminUser";
import { createToken, setSessionCookie } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: "Usuário e senha são obrigatórios." },
        { status: 400 },
      );
    }

    const valid = await validateAdminPassword(username, password);
    if (!valid) {
      return NextResponse.json(
        { error: "Credenciais inválidas." },
        { status: 401 },
      );
    }

    const token = await createToken(username);
    await setSessionCookie(token);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
