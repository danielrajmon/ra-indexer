import { File } from "../types/file";
import { query, QueryExecutor } from "./client";

export async function getGameFiles(gameId: number): Promise<File[] | null> {
  return query<File>('SELECT md5, name, labels, patch_url as "patchUrl", is_owned as "isOwned" FROM files WHERE game_id = $1', [gameId]);
}

export async function insertGameFiles(platformId: number, gameId: number, files: File[], executeQuery: QueryExecutor = query): Promise<void> {
  for (const file of files) {
    const normalizedMd5 = file.md5.toLowerCase();

    await executeQuery(`
      INSERT INTO files
        (platform_id, game_id, name, md5, patch_url, labels)
      VALUES
        ($1, $2, $3, $4, $5, $6)
    `, [platformId, gameId, file.name, normalizedMd5, file.patchUrl, file.labels ?? []]);
  }
}

export async function replaceGameFiles(platformId: number, gameId: number, files: File[], executeQuery: QueryExecutor = query): Promise<void> {
  await executeQuery(`
    DELETE FROM files
     WHERE platform_id = $1
       AND game_id = $2
  `, [platformId, gameId]);

  await insertGameFiles(platformId, gameId, files, executeQuery);
}