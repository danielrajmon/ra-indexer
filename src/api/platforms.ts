import { getConsoleIds, getGameList, type FetchedSystem } from "@retroachievements/api";

import { callRaApi } from "./client";

export type PlatformGame = {
  id: number;
  title: string;
  achievementCount: number;
  leaderboardCount: number;
  pointTotal: number;
};

export async function getPlatforms(): Promise<FetchedSystem[]> {
  return callRaApi((authorization) =>
    getConsoleIds(authorization, {
      shouldOnlyRetrieveActiveSystems: false,
      shouldOnlyRetrieveGameSystems: true,
    }),
    "getPlatforms()",
  );
}

export async function getGameListForPlatform(
  consoleId: number,
  progressPrefix?: string,
): Promise<PlatformGame[]> {
  const games = await callRaApi((authorization) =>
    getGameList(authorization, {
      consoleId,
    }),
    `getGameList(consoleId=${consoleId}) ${progressPrefix ? `${progressPrefix} ` : ""}`,
  );

  return games.map((game) => ({
    id: game.id,
    title: game.title,
    achievementCount: game.numAchievements ?? 0,
    leaderboardCount: game.numLeaderboards ?? 0,
    pointTotal: game.points ?? 0,
  }));
}