import { Game } from "../types/game";

import { getGameList } from "@retroachievements/api";

import { callRaApi } from "./client";

export async function getGameListForPlatform(platformId: number, platformName: string): Promise<Game[]> {
  const trimmedPlatformName = platformName.trim();

  if (!trimmedPlatformName) {
    throw new Error(`Missing platform name for platform id=${platformId}`);
  }

  const platformLabel = `${trimmedPlatformName} [id=${platformId}]`;

  return callRaApi((authorization) => getGameList(authorization, {
    consoleId: platformId,
    shouldOnlyRetrieveGamesWithAchievements: true,
    shouldRetrieveGameHashes: true,
  }), `getGameList(${platformLabel})`);

}