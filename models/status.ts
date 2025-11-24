import database from "infra/database";

async function getStatus() {
  const databaseName = process.env.POSTGRES_DB || "";
  const version = await database.query({ text: "SHOW server_version;" });
  const maxConnections = await database.query({ text: "SHOW max_connections" });
  const updateAt = new Date().toISOString();

  const usedConnections = await database.query({
    text: "SELECT count(*) AS used_connections FROM pg_stat_activity WHERE datname= $1",
    values: [databaseName],
  });

  return {
    updated_at: updateAt,
    version: version.rows[0].server_version,
    maxConnections: Number(maxConnections.rows[0].max_connections),
    usedConnections: Number(usedConnections.rows[0].used_connections),
  };
}

export default getStatus;
