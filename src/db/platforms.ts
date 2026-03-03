import { Platform } from "../types/platform";
import { query, queryOne } from "./client";

export async function getPlatforms(): Promise<Platform[]> {
  return query<Platform>('SELECT id, name FROM platforms ORDER BY id ASC');
}

export async function getPlatformById(platformId: number): Promise<Platform | null> {
  return queryOne<Platform>('SELECT id, name FROM platforms WHERE id = $1', [platformId]);
}

export async function insertPlatform(platform: Platform): Promise<void> {
  await query('INSERT INTO platforms(id, name, updated_at) VALUES($1, $2, NOW())', [platform.id, platform.name]);
}