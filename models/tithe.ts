import database from "@/infra/database";

export type Tithe = {
  id: string;
  member_id: string | null;
  nome_contribuinte: string;
  valor: number;
  mes: number;
  ano: number;
  forma_pagamento: string;
  observacao: string | null;
  created_at: string;
};

export type CreateTitheInput = Omit<Tithe, "id" | "created_at">;

export type MonthlyTotal = {
  mes: number;
  ano: number;
  total: number;
  quantidade: number;
};

export async function listTithes(mes?: number, ano?: number): Promise<Tithe[]> {
  if (mes && ano) {
    const result = await database.query({
      text: "SELECT * FROM tithes WHERE mes = $1 AND ano = $2 ORDER BY created_at DESC",
      values: [mes, ano],
    });
    return result.rows;
  }
  const result = await database.query({
    text: "SELECT * FROM tithes ORDER BY ano DESC, mes DESC, created_at DESC",
  });
  return result.rows;
}

export async function getTitheById(id: string): Promise<Tithe | null> {
  const result = await database.query({
    text: "SELECT * FROM tithes WHERE id = $1",
    values: [id],
  });
  return result.rows[0] ?? null;
}

export async function createTithe(data: CreateTitheInput): Promise<Tithe> {
  const result = await database.query({
    text: `INSERT INTO tithes (member_id, nome_contribuinte, valor, mes, ano, forma_pagamento, observacao)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           RETURNING *`,
    values: [
      data.member_id,
      data.nome_contribuinte,
      data.valor,
      data.mes,
      data.ano,
      data.forma_pagamento,
      data.observacao,
    ],
  });
  return result.rows[0];
}

export async function updateTithe(
  id: string,
  data: Partial<CreateTitheInput>,
): Promise<Tithe | null> {
  const result = await database.query({
    text: `UPDATE tithes
           SET member_id = COALESCE($1, member_id),
               nome_contribuinte = COALESCE($2, nome_contribuinte),
               valor = COALESCE($3, valor),
               mes = COALESCE($4, mes),
               ano = COALESCE($5, ano),
               forma_pagamento = COALESCE($6, forma_pagamento),
               observacao = COALESCE($7, observacao)
           WHERE id = $8
           RETURNING *`,
    values: [
      data.member_id,
      data.nome_contribuinte,
      data.valor,
      data.mes,
      data.ano,
      data.forma_pagamento,
      data.observacao,
      id,
    ],
  });
  return result.rows[0] ?? null;
}

export async function deleteTithe(id: string): Promise<boolean> {
  const result = await database.query({
    text: "DELETE FROM tithes WHERE id = $1",
    values: [id],
  });
  return (result.rowCount ?? 0) > 0;
}

export async function getMonthlyTotals(months = 12): Promise<MonthlyTotal[]> {
  const result = await database.query({
    text: `SELECT mes, ano,
                  SUM(valor)::numeric AS total,
                  COUNT(*)::integer AS quantidade
           FROM tithes
           WHERE (ano * 12 + mes) >= (
             (EXTRACT(YEAR FROM NOW())::integer * 12 + EXTRACT(MONTH FROM NOW())::integer) - $1 + 1
           )
           GROUP BY mes, ano
           ORDER BY ano ASC, mes ASC`,
    values: [months],
  });
  return result.rows;
}

export async function getDashboardStats() {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
  const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;

  const [currentResult, prevResult, totalMembersResult] = await Promise.all([
    database.query({
      text: `SELECT COALESCE(SUM(valor), 0)::numeric AS total, COUNT(*)::integer AS quantidade
             FROM tithes WHERE mes = $1 AND ano = $2`,
      values: [currentMonth, currentYear],
    }),
    database.query({
      text: `SELECT COALESCE(SUM(valor), 0)::numeric AS total, COUNT(*)::integer AS quantidade
             FROM tithes WHERE mes = $1 AND ano = $2`,
      values: [prevMonth, prevYear],
    }),
    database.query({
      text: "SELECT COUNT(*)::integer AS total FROM members WHERE ativo = true",
    }),
  ]);

  return {
    mesAtual: {
      total: parseFloat(currentResult.rows[0].total),
      quantidade: currentResult.rows[0].quantidade,
    },
    mesAnterior: {
      total: parseFloat(prevResult.rows[0].total),
      quantidade: prevResult.rows[0].quantidade,
    },
    totalMembros: totalMembersResult.rows[0].total,
  };
}
