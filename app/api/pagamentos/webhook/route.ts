import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { findPaymentBySessionId, createPaymentLog, updatePaymentStatus } from "@/models/payment";
import { createTithe } from "@/models/tithe";

// Try to publish to Kafka, but fall back to direct processing if Kafka is unavailable
async function publishToKafka(event: string, data: Record<string, unknown>): Promise<boolean> {
  try {
    const { getProducer, TOPICS } = await import("@/infra/kafka");
    const producer = await getProducer();
    await producer.send({
      topic: TOPICS.PAGAMENTOS_CONFIRMADOS,
      messages: [{ key: data.session_id as string, value: JSON.stringify({ event, data }) }],
    });
    return true;
  } catch {
    console.warn("Kafka indisponível — processando pagamento diretamente.");
    return false;
  }
}

async function processPaymentDirectly(sessionId: string, paymentIntent: string) {
  const payment = await findPaymentBySessionId(sessionId);
  if (!payment || payment.status === "confirmado") return;

  const now = new Date();
  const tithe = await createTithe({
    member_id: null,
    nome_contribuinte: payment.nome_contribuinte,
    valor: payment.valor,
    mes: now.getMonth() + 1,
    ano: now.getFullYear(),
    forma_pagamento: payment.metodo === "pix" ? "pix" : "cartao",
    observacao: `Pagamento online via Stripe (${payment.metodo})`,
  });

  await updatePaymentStatus(payment.id, "confirmado", {
    stripe_payment_intent: paymentIntent,
    tithe_id: tithe.id,
  });
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Assinatura ausente." }, { status: 400 });
  }

  let event;
  try {
    event = getStripe().webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET || "",
    );
  } catch (err) {
    console.error("Erro na verificação do webhook:", err);
    return NextResponse.json({ error: "Assinatura inválida." }, { status: 400 });
  }

  // Log the event
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const sessionId = session.id;
    const paymentIntent = (session.payment_intent as string) || "";

    const payment = await findPaymentBySessionId(sessionId);
    if (payment) {
      await createPaymentLog({
        payment_id: payment.id,
        evento: event.type,
        payload: session as unknown as Record<string, unknown>,
      });
    }

    // Try Kafka first, fall back to direct processing
    const published = await publishToKafka(event.type, {
      session_id: sessionId,
      payment_intent: paymentIntent,
    });

    if (!published) {
      await processPaymentDirectly(sessionId, paymentIntent);
    }
  }

  return NextResponse.json({ received: true });
}
