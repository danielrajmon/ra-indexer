import { Platform } from "../types/platforms";
import { query, queryOne } from "./client";

export async function getPlatforms(): Promise<Platform[]> {
  return query<Platform>(`
    SELECT platform_id AS id,
           platform_name AS name,
           is_active AS active
      FROM platforms p
      ORDER BY p.platform_id ASC
    `,
  );
}

export async function getPlatformById(platformId: number): Promise<Platform | null> {
  return queryOne<Platform>(`
    SELECT platform_id AS id,
           platform_name AS name
      FROM platforms
     WHERE platform_id = $1
  `, [platformId]);
}

export async function insertPlatform(platform: Platform): Promise<void> {
  await query(`
    INSERT INTO platforms
      (platform_id, platform_name, is_active, updated_at)
    VALUES
      ($1, $2, $3,NOW())
  `, [platform.id, platform.name, platform.active]);
}

export async function updatePlatform(platform: Platform): Promise<void> {
  await query(`
    UPDATE platforms
       SET platform_name = $2,
           is_active = $3,
           updated_at = NOW()
     WHERE platform_id = $1
  `, [platform.id, platform.name, platform.active]);
}