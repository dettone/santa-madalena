import database from "@/infra/database";

export type Content = {
  id: string;
  tipo: "aviso" | "reflexao" | "evento";
  titulo: string;
  corpo: string;
  imagem_url: string | null;
  publicado: boolean;
  data_publicacao: string;
  created_at: string;
  updated_at: string;
};

export type CreateContentInput = Omit<Content, "id" | "created_at" | "updated_at">;

export async function listPublicContents(): Promise<Content[]> {
  const result = await database.query({
    text: `SELECT * FROM contents
           WHERE publicado = true AND data_publicacao <= CURRENT_DATE
           ORDER BY data_publicacao DESC, created_at DESC
           LIMIT 20`,
  });
  return result.rows;
}

export async function listAllContents(): Promise<Content[]> {
  const result = await database.query({
    text: "SELECT * FROM contents ORDER BY data_publicacao DESC, created_at DESC",
  });
  return result.rows;
}

export async function getContentById(id: string): Promise<Content | null> {
  const result = await database.query({
    text: "SELECT * FROM contents WHERE id = $1",
    values: [id],
  });
  return result.rows[0] ?? null;
}

export async function createContent(data: CreateContentInput): Promise<Content> {
  const result = await database.query({
    text: `INSERT INTO contents (tipo, titulo, corpo, imagem_url, publicado, data_publicacao)
           VALUES ($1, $2, $3, $4, $5, $6)
           RETURNING *`,
    values: [data.tipo, data.titulo, data.corpo, data.imagem_url, data.publicado, data.data_publicacao],
  });
  return result.rows[0];
}

export async function updateContent(
  id: string,
  data: Partial<CreateContentInput>,
): Promise<Content | null> {
  const result = await database.query({
    text: `UPDATE contents
           SET tipo = COALESCE($1, tipo),
               titulo = COALESCE($2, titulo),
               corpo = COALESCE($3, corpo),
               imagem_url = COALESCE($4, imagem_url),
               publicado = COALESCE($5, publicado),
               data_publicacao = COALESCE($6, data_publicacao),
               updated_at = now() at time zone 'utc'
           WHERE id = $7
           RETURNING *`,
    values: [data.tipo, data.titulo, data.corpo, data.imagem_url, data.publicado, data.data_publicacao, id],
  });
  return result.rows[0] ?? null;
}

export async function deleteContent(id: string): Promise<boolean> {
  const result = await database.query({
    text: "DELETE FROM contents WHERE id = $1",
    values: [id],
  });
  return (result.rowCount ?? 0) > 0;
}
