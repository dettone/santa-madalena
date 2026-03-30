import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { createPayment } from "@/models/payment";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);

    // Support both JSON and form data
    let nome: string, email: string | undefined, valor: number, metodo: string;

    if (body) {
      nome = body.nome;
      email = body.email;
      valor = parseFloat(body.valor);
      metodo = body.metodo || "pix";
    } else {
      const formData = await request.formData();
      nome = formData.get("nome") as string;
      email = (formData.get("email") as string) || undefined;
      valor = parseFloat(formData.get("valor") as string);
      metodo = (formData.get("metodo") as string) || "pix";
    }

    if (!nome || !valor || valor <= 0) {
      return NextResponse.json({ error: "Nome e valor são obrigatórios." }, { status: 400 });
    }

    if (!["pix", "cartao"].includes(metodo)) {
      return NextResponse.json({ error: "Método deve ser 'pix' ou 'cartao'." }, { status: 400 });
    }

    const origin = request.nextUrl.origin;

    const paymentMethodTypes = metodo === "pix" ? ["pix" as const] : ["card" as const];

    const session = await getStripe().checkout.sessions.create({
      payment_method_types: paymentMethodTypes,
      line_items: [
        {
          price_data: {
            currency: "brl",
            product_data: {
              name: "Dízimo – Comunidade Santa Madalena",
              description: `Contribuição de ${nome}`,
            },
            unit_amount: Math.round(valor * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      customer_email: email || undefined,
      metadata: {
        nome_contribuinte: nome,
        metodo,
      },
      success_url: `${origin}/?pagamento=sucesso`,
      cancel_url: `${origin}/?pagamento=cancelado`,
    });

    // Register payment in DB
    await createPayment({
      stripe_session_id: session.id,
      nome_contribuinte: nome,
      email: email || null,
      valor,
      metodo: metodo as "pix" | "cartao",
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Erro ao criar sessão de pagamento:", error);
    return NextResponse.json({ error: "Erro ao processar pagamento." }, { status: 500 });
  }
}
