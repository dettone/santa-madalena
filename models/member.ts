import database from "@/infra/database";

export type Member = {
  id: string;
  nome: string;
  email: string | null;
  telefone: string | null;
  endereco: string | null;
  ativo: boolean;
  created_at: string;
  updated_at: string;
};

export type CreateMemberInput = Omit<Member, "id" | "created_at" | "updated_at">;

export async function listMembers(): Promise<Member[]> {
  const result = await database.query({
    text: "SELECT * FROM members ORDER BY nome ASC",
  });
  return result.rows;
}

export async function getMemberById(id: string): Promise<Member | null> {
  const result = await database.query({
    text: "SELECT * FROM members WHERE id = $1",
    values: [id],
  });
  return result.rows[0] ?? null;
}

export async function createMember(data: CreateMemberInput): Promise<Member> {
  const result = await database.query({
    text: `INSERT INTO members (nome, email, telefone, endereco, ativo)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING *`,
    values: [data.nome, data.email, data.telefone, data.endereco, data.ativo],
  });
  return result.rows[0];
}

export async function updateMember(
  id: string,
  data: Partial<CreateMemberInput>,
): Promise<Member | null> {
  const result = await database.query({
    text: `UPDATE members
           SET nome = COALESCE($1, nome),
               email = COALESCE($2, email),
               telefone = COALESCE($3, telefone),
               endereco = COALESCE($4, endereco),
               ativo = COALESCE($5, ativo),
               updated_at = now() at time zone 'utc'
           WHERE id = $6
           RETURNING *`,
    values: [data.nome, data.email, data.telefone, data.endereco, data.ativo, id],
  });
  return result.rows[0] ?? null;
}

export async function deleteMember(id: string): Promise<boolean> {
  const result = await database.query({
    text: "DELETE FROM members WHERE id = $1",
    values: [id],
  });
  return (result.rowCount ?? 0) > 0;
}
