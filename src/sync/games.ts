import { getPlatforms } from "../db/platforms";
import { getGameById, insertGame, updateGame } from "../db/games";
import { getGameFiles, insertGameFiles, replaceGameFiles } from "../db/files";
import { getGameListForPlatform } from "../api/gamelists";
import { Game } from "../types/game";
import { getFilesForGame } from "../api/files";

function haveDifferentHashes(existingHashes: string[], incomingHashes: string[]): boolean {
  if (existingHashes.length !== incomingHashes.length) {
    return true;
  }

  const existingSet = new Set(existingHashes);
  return incomingHashes.some((hash) => !existingSet.has(hash));
}

async function upsertGame(platformId: number, game: Game): Promise<void> {
  const existingGame = await getGameById(game.id);

  if (!existingGame) {
    const files = await getFilesForGame(game.id);

    console.log(`Adding game ${game.title} to platform ID ${platformId}.`);
    await insertGame(platformId, game);
    await insertGameFiles(platformId, game.id, files);

    return;
  }

  if (existingGame.title !== game.title ||
    existingGame.numAchievements !== game.numAchievements ||
    existingGame.numLeaderboards !== game.numLeaderboards ||
    existingGame.points !== game.points) {

    console.log(`Game ${game.title} (ID: ${game.id}) has changed. Updating it.`);
    await updateGame(platformId, game);
  }

  const existingGameFiles = await getGameFiles(game.id);
  const dbHashes = (existingGameFiles ?? []).map((file) => file.md5);
  const apiHashes = game.hashes ?? [];

  if (haveDifferentHashes(dbHashes, apiHashes)) {
    if ((existingGameFiles ?? []).some((file) => file.isOwned)) {
      throw new Error(`Cannot refresh files for game ${game.id}: one or more files are owned.`);
    }

    const files = await getFilesForGame(game.id);

    console.log(`Game ${game.title} (ID: ${game.id}) hash list changed. Refreshing files.`);
    await updateGame(platformId, game);
    await replaceGameFiles(platformId, game.id, files);
  }

}

export async function processGames(): Promise<void> {
  const platforms = await getPlatforms();

  for (const platform of platforms) {
    const gameList = await getGameListForPlatform(platform.id);

    for (const game of gameList) {
      await upsertGame(platform.id, game);
    }
  }
}
