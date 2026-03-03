import { getGameHashes, type GameHashes } from "@retroachievements/api";
import { File } from "../types/file";

import { callRaApi } from "./client";

export async function getFilesForGame(gameId: number): Promise<File[]> {
  const response = await callRaApi(
    (authorization) =>
      getGameHashes(authorization, {
        gameId,
      }),
    `getFilesForGame(gameId=${gameId})}`,
  );

  return response.results;
}