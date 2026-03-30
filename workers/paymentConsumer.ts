import "dotenv/config";
import { createConsumer, TOPICS } from "../infra/kafka";
import { findPaymentBySessionId, updatePaymentStatus, createPaymentLog } from "../models/payment";
import { createTithe } from "../models/tithe";

async function main() {
  console.log("✠ Iniciando consumer de pagamentos...");

  const consumer = createConsumer("santa-madalena-payments");

  await consumer.connect();
  await consumer.subscribe({ topic: TOPICS.PAGAMENTOS_CONFIRMADOS, fromBeginning: false });

  console.log(`✠ Ouvindo tópico: ${TOPICS.PAGAMENTOS_CONFIRMADOS}`);

  await consumer.run({
    eachMessage: async ({ message }) => {
      try {
        const raw = message.value?.toString();
        if (!raw) return;

        const { event, data } = JSON.parse(raw);
        console.log(`📩 Evento recebido: ${event} | session=${data.session_id}`);

        const payment = await findPaymentBySessionId(data.session_id);
        if (!payment) {
          console.warn(`⚠ Pagamento não encontrado para session: ${data.session_id}`);
          return;
        }

        if (payment.status === "confirmado") {
          console.log(`ℹ Pagamento já confirmado: ${payment.id}`);
          return;
        }

        // Create tithe record
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

        // Update payment with confirmed status
        await updatePaymentStatus(payment.id, "confirmado", {
          stripe_payment_intent: data.payment_intent,
          tithe_id: tithe.id,
        });

        // Log the processing
        await createPaymentLog({
          payment_id: payment.id,
          evento: "consumer.processed",
          payload: { tithe_id: tithe.id, processed_at: new Date().toISOString() },
        });

        console.log(`✅ Pagamento ${payment.id} confirmado → Dízimo ${tithe.id} criado.`);
      } catch (error) {
        console.error("❌ Erro ao processar mensagem:", error);
      }
    },
  });
}

main().catch((err) => {
  console.error("❌ Falha fatal no consumer:", err);
  process.exit(1);
});
