import { Pool } from "pg";

const pool = new Pool({
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT || "5432", 10),
  database: process.env.POSTGRES_DB,
});

export async function query<T = any>(text: string, values?: any[]): Promise<T[]> {
  const result = await pool.query(text, values);
  return result.rows;
}

export async function queryOne<T = any>(text: string, values?: any[]): Promise<T | null> {
  const result = await pool.query(text, values);
  return result.rows[0] || null;
}