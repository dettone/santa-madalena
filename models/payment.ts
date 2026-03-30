import database from "@/infra/database";

export type Payment = {
  id: string;
  stripe_session_id: string;
  stripe_payment_intent: string | null;
  nome_contribuinte: string;
  email: string | null;
  valor: number;
  metodo: "pix" | "cartao";
  status: "pendente" | "confirmado" | "falhou";
  tithe_id: string | null;
  created_at: string;
};

export type PaymentLog = {
  id: string;
  payment_id: string;
  evento: string;
  payload: Record<string, unknown>;
  created_at: string;
};

export async function createPayment(data: {
  stripe_session_id: string;
  nome_contribuinte: string;
  email?: string | null;
  valor: number;
  metodo: "pix" | "cartao";
}): Promise<Payment> {
  const result = await database.query({
    text: `INSERT INTO payments (stripe_session_id, nome_contribuinte, email, valor, metodo)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING *`,
    values: [data.stripe_session_id, data.nome_contribuinte, data.email ?? null, data.valor, data.metodo],
  });
  return result.rows[0];
}

export async function findPaymentBySessionId(sessionId: string): Promise<Payment | null> {
  const result = await database.query({
    text: "SELECT * FROM payments WHERE stripe_session_id = $1",
    values: [sessionId],
  });
  return result.rows[0] ?? null;
}

export async function updatePaymentStatus(
  id: string,
  status: Payment["status"],
  extra?: { stripe_payment_intent?: string; tithe_id?: string },
): Promise<Payment | null> {
  const result = await database.query({
    text: `UPDATE payments
           SET status = $1,
               stripe_payment_intent = COALESCE($2, stripe_payment_intent),
               tithe_id = COALESCE($3, tithe_id)
           WHERE id = $4
           RETURNING *`,
    values: [status, extra?.stripe_payment_intent ?? null, extra?.tithe_id ?? null, id],
  });
  return result.rows[0] ?? null;
}

export async function listPayments(status?: string): Promise<Payment[]> {
  if (status) {
    const result = await database.query({
      text: "SELECT * FROM payments WHERE status = $1 ORDER BY created_at DESC",
      values: [status],
    });
    return result.rows;
  }
  const result = await database.query({
    text: "SELECT * FROM payments ORDER BY created_at DESC",
  });
  return result.rows;
}

export async function createPaymentLog(data: {
  payment_id: string;
  evento: string;
  payload: Record<string, unknown>;
}): Promise<PaymentLog> {
  const result = await database.query({
    text: `INSERT INTO payment_logs (payment_id, evento, payload)
           VALUES ($1, $2, $3)
           RETURNING *`,
    values: [data.payment_id, data.evento, JSON.stringify(data.payload)],
  });
  return result.rows[0];
}

export async function listPaymentLogs(paymentId: string): Promise<PaymentLog[]> {
  const result = await database.query({
    text: "SELECT * FROM payment_logs WHERE payment_id = $1 ORDER BY created_at ASC",
    values: [paymentId],
  });
  return result.rows;
}
