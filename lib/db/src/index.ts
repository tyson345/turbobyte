import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

type PgClientOrPool = InstanceType<typeof pg.Pool> | InstanceType<typeof pg.Client>;

function databaseUrl(): string {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL must be set. Did you forget to provision a database?",
    );
  }
  return connectionString;
}

let poolInstance: InstanceType<typeof Pool> | undefined;

function getPool(): InstanceType<typeof Pool> {
  poolInstance ??= new Pool({ connectionString: databaseUrl() });
  return poolInstance;
}

export const pool = new Proxy({} as InstanceType<typeof Pool>, {
  get(_target, property) {
    const instance = getPool();
    const value = Reflect.get(instance, property, instance);
    return typeof value === "function" ? value.bind(instance) : value;
  },
});

/**
 * A schema-backed Drizzle database instance. This is the shared type used
 * across the codebase so request handlers and background jobs can accept an
 * explicitly injected database (e.g. a per-request Hyperdrive-backed client in
 * Cloudflare Workers) without depending on the module-global default.
 */
export type Database = NodePgDatabase<typeof schema>;

/**
 * Build a schema-backed Drizzle database from an already-connected `pg`
 * client or pool. Used by the Cloudflare Worker to create a request-scoped
 * database over `env.HYPERDRIVE.connectionString`, and by the scheduled
 * handler for its per-invocation client. The Node/Replit path keeps using the
 * lazy module-global `db` below unchanged.
 */
export function createDatabase(client: PgClientOrPool): Database {
  return drizzle(client as InstanceType<typeof pg.Pool>, { schema });
}

let databaseInstance: Database | undefined;

export const db = new Proxy({} as Database, {
  get(_target, property) {
    databaseInstance ??= createDatabase(getPool());
    const value = Reflect.get(databaseInstance, property, databaseInstance);
    return typeof value === "function" ? value.bind(databaseInstance) : value;
  },
});

export * from "./schema";
