import { query, queryOne } from "./client";

type PlatformRecord = {
  id: number;
  name: string;
};

export async function getPlatformById(platformId: number): Promise<PlatformRecord | null> {
  return queryOne<PlatformRecord>(`
    SELECT platform_id AS id,
           platform_name AS name
      FROM platforms
     WHERE platform_id = $1
  `, [platformId]);
}

