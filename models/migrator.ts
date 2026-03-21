"use-server";
import { runner as migrationRunner, type RunnerOption } from "node-pg-migrate";
import { resolve } from "node:path";
import database from "infra/database";

type BaseRunnerOptions = Omit<RunnerOption, "dbClient" | "databaseUrl">;

const defaultMigrationOptions: BaseRunnerOptions = {
  dir: resolve("infra", "migrations"),
  migrationsTable: "pgmigrations",
  direction: "up",
  dryRun: false,
  log: () => {},
};

async function listPendingMigrations() {
  let dbClient;

  try {
    dbClient = await database.getNewClient();

    const pendingMigrations = await migrationRunner({
      ...defaultMigrationOptions,
      dbClient,
    });

    return pendingMigrations;
  } catch (error) {
    console.error("Error listing pending migrations:", error);
    throw error;
  } finally {
    if (dbClient) {
      await dbClient.end();
    }
  }
}

async function runPendingMigrations() {
  let dbClient;
  try {
    dbClient = await database.getNewClient();

    const migratedMigrations = await migrationRunner({
      ...defaultMigrationOptions,
      dbClient,
      dryRun: false,
    });

    await dbClient.end();

    return migratedMigrations;
  } finally {
    await dbClient?.end();
  }
}

const migrator = {
  listPendingMigrations,
  runPendingMigrations,
};

export default migrator;
