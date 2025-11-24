import { Client } from "pg";

async function query(queryObject: { text: string; values?: unknown[] }) {
  let client;
  try {
    client = await getNewClient();
    const result = await client.query(queryObject);
    return result;
  } catch (error) {
    console.error("Error executing query:", error);
    throw error;
  } finally {
    if (client) {
      await client.end();
    }
  }
}

function getSSLValues() {
  if (process.env.POSTGRES_CA) {
    return { ca: process.env.POSTGRES_CA };
  }
  return process.env.NODE_ENV === "development" ||
    process.env.NODE_ENV === "test"
    ? false
    : true;
}

async function getNewClient() {
  const client = new Client({
    host: process.env.POSTGRES_HOST,
    port: parseInt(
      process.env.POSTGRES_PORT ? process.env.POSTGRES_PORT : "5432",
    ),
    user: process.env.POSTGRES_USER,
    database: process.env.POSTGRES_DB,
    password: process.env.POSTGRES_PASSWORD,
    ssl: getSSLValues(),
  });

  await client.connect();
  return client;
}

const database = {
  query,
  getNewClient,
};

export default database;
