import { getConsoleIds, type FetchedSystem } from "@retroachievements/api";

import { callRaApi } from "./client";

export async function getPlatforms(): Promise<FetchedSystem[]> {
  return callRaApi((authorization) =>
    getConsoleIds(authorization, {
      shouldOnlyRetrieveActiveSystems: true,
      shouldOnlyRetrieveGameSystems: true,
    }),
    "getPlatforms()",
  );
}