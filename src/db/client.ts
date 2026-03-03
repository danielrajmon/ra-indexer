import { Pool } from "pg";

const pool = new Pool({
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT || "5432", 10),
  database: process.env.POSTGRES_DB,
});

export type QueryExecutor = <T = any>(text: string, values?: any[]) => Promise<T[]>;

export async function query<T = any>(text: string, values?: any[]): Promise<T[]> {
  const result = await pool.query(text, values);
  return result.rows;
}

export async function queryOne<T = any>(text: string, values?: any[]): Promise<T | null> {
  const result = await pool.query(text, values);
  return result.rows[0] || null;
}

export async function withTransaction<T>(callback: (txQuery: QueryExecutor) => Promise<T>): Promise<T> {
  const client = await pool.connect();

  const txQuery: QueryExecutor = async <U = any>(text: string, values?: any[]) => {
    const result = await client.query(text, values);
    return result.rows as U[];
  };

  try {
    await client.query("BEGIN");
    const result = await callback(txQuery);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}