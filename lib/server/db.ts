import "dotenv/config";
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "../shared/schema";

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL is not set!');
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

console.log('🔐 DATABASE_URL exists:', !!process.env.DATABASE_URL);
console.log('🔐 DATABASE_URL host:', process.env.DATABASE_URL?.match(/@([^:]+):/)?.[1] || 'unknown');

// Parse DATABASE_URL - handle special characters in password
let connectionString = process.env.DATABASE_URL;
// URL constructor doesn't handle special chars in password, so parse manually
const match = connectionString.match(/^postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)$/);
if (!match) {
  console.error('❌ Invalid DATABASE_URL format:', connectionString.substring(0, 50) + '...');
  throw new Error("Invalid DATABASE_URL format");
}

const [, user, password, host, port, database] = match;

console.log('📊 Database connection config:', {
  host,
  port: parseInt(port, 10),
  database,
  user,
  hasPassword: !!password
});

export const pool = new Pool({ 
  host,
  port: parseInt(port, 10),
  database,
  user,
  password,
  ssl: { rejectUnauthorized: false }, // Supabase requires SSL
  max: 10, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 10000, // Return an error after 10 seconds if connection could not be established
});

// Handle pool errors
pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle client:', err);
});

// Test connection on startup
pool.query('SELECT NOW()')
  .then(() => {
    console.log('✅ Database connection successful');
  })
  .catch((err) => {
    console.error('❌ Database connection failed:', err.message);
    console.error('❌ Error details:', err);
  });

export const db = drizzle({ client: pool, schema });
