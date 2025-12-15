import "dotenv/config";
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Parse DATABASE_URL - handle special characters in password
let connectionString = process.env.DATABASE_URL;
// URL constructor doesn't handle special chars in password, so parse manually
const match = connectionString.match(/^postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)$/);
if (!match) {
  throw new Error("Invalid DATABASE_URL format");
}

const [, user, password, host, port, database] = match;

export const pool = new Pool({ 
  host,
  port: parseInt(port, 10),
  database,
  user,
  password,
  ssl: { rejectUnauthorized: false } // Supabase requires SSL
});
export const db = drizzle({ client: pool, schema });
