import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

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

function createDatabase() {
  return drizzle(getPool(), { schema });
}

let databaseInstance: ReturnType<typeof createDatabase> | undefined;

export const db = new Proxy({} as ReturnType<typeof createDatabase>, {
  get(_target, property) {
    databaseInstance ??= createDatabase();
    const value = Reflect.get(databaseInstance, property, databaseInstance);
    return typeof value === "function" ? value.bind(databaseInstance) : value;
  },
});

export * from "./schema";
