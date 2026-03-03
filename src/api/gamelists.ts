import { Game } from "../types/game";

import { getGameList } from "@retroachievements/api";

import { callRaApi } from "./client";

export async function getGameListForPlatform(platformId: number): Promise<Game[]> {
  return callRaApi((authorization) => getGameList(authorization, {
    consoleId: platformId,
    shouldOnlyRetrieveGamesWithAchievements: true,
    shouldRetrieveGameHashes: true,
  }), `getGameList(${platformId})`);

}