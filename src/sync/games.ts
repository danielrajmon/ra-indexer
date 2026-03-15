import { getPlatforms } from "../db/platforms";
import { getGameById, insertGame, updateGame } from "../db/games";
import { getGameFiles, insertGameFiles, replaceGameFiles } from "../db/files";
import { withTransaction } from "../db/client";
import { getGameListForPlatform } from "../api/gamelists";
import { Game } from "../types/game";
import { getFilesForGame } from "../api/files";

const SKIPPED_GAME_TITLE_PREFIXES = [
  "~Demo~",
  "~Hack~",
  "~Homebrew~",
  "~Prototype~",
  "~Test Kit~",
  "~Unlicensed~",
  "~Z~"
];

const SKIPPED_GAME_TITLE_CONTAINS = ["[Subset"];
const UPSERT_COOLDOWN_MS = 24 * 60 * 60 * 1000;

function haveDifferentHashes(existingHashes: string[], incomingHashes: string[]): boolean {
  const normalizedIncomingHashes = incomingHashes.map((hash) => hash.toLowerCase());

  if (existingHashes.length !== normalizedIncomingHashes.length) {
    return true;
  }

  const existingSet = new Set(existingHashes);
  return normalizedIncomingHashes.some((hash) => !existingSet.has(hash));
}

function shouldSkipInsertForTitle(title: string): boolean {
  return SKIPPED_GAME_TITLE_PREFIXES.some((prefix) => title.startsWith(prefix)) ||
    SKIPPED_GAME_TITLE_CONTAINS.some((token) => title.includes(token));
}

function wasUpdatedInLast24Hours(updatedAt?: string | Date): boolean {
  if (!updatedAt) {
    return false;
  }

  const updatedTimestamp = new Date(updatedAt).getTime();

  if (Number.isNaN(updatedTimestamp)) {
    return false;
  }

  return (Date.now() - updatedTimestamp) < UPSERT_COOLDOWN_MS;
}

function getGameChanges(existingGame: Game, incomingGame: Game): string[] {
  const changes: string[] = [];

  if (existingGame.title !== incomingGame.title) {
    changes.push(`title: "${existingGame.title}" -> "${incomingGame.title}"`);
  }

  if (existingGame.numAchievements !== incomingGame.numAchievements) {
    changes.push(`numAchievements: ${existingGame.numAchievements} -> ${incomingGame.numAchievements}`);
  }

  if (existingGame.numLeaderboards !== incomingGame.numLeaderboards) {
    changes.push(`numLeaderboards: ${existingGame.numLeaderboards} -> ${incomingGame.numLeaderboards}`);
  }

  if (existingGame.points !== incomingGame.points) {
    changes.push(`points: ${existingGame.points} -> ${incomingGame.points}`);
  }

  return changes;
}

async function upsertGame(platformId: number, game: Game): Promise<void> {
  const existingGame = await getGameById(game.id);

  if (!existingGame) {
    if (shouldSkipInsertForTitle(game.title)) {
      // console.log(`Skipping insert for game ${game.title} (ID: ${game.id}) due to title filter.`);
      return;
    }

    const files = await getFilesForGame(game.id);

    console.log(`Adding game ${game.title} to platform ID ${platformId}.`);
    await withTransaction(async (txQuery) => {
      await insertGame(platformId, game, txQuery);
      await insertGameFiles(platformId, game.id, files, txQuery);
    });

    return;
  }

  if (wasUpdatedInLast24Hours(existingGame.updatedAt)) {
    // console.log(`Skipping upsert for game ${game.title} (ID: ${game.id}) because it was updated within the last 24 hours.`);
    return;
  }

  if (existingGame.title !== game.title ||
    existingGame.numAchievements !== game.numAchievements ||
    existingGame.numLeaderboards !== game.numLeaderboards ||
    existingGame.points !== game.points) {

    const changedFields = getGameChanges(existingGame, game);

    console.log(`Game ${game.title} (ID: ${game.id}) has changed. Updating it. Changes: ${changedFields.join(", ")}`);
    await updateGame(platformId, game);
  }

  const existingGameFiles = await getGameFiles(game.id);
  const dbHashes = (existingGameFiles ?? []).map((file) => file.md5);
  const apiHashes = game.hashes ?? [];
  const preservedRequiredHashes = (existingGameFiles ?? [])
    .filter((file) => file.isRequired === true)
    .map((file) => file.md5.toLowerCase());
  const preservedOwnedHashes = (existingGameFiles ?? [])
    .filter((file) => file.isOwned)
    .map((file) => file.md5.toLowerCase());

  if (haveDifferentHashes(dbHashes, apiHashes)) {
    const ownedFiles = (existingGameFiles ?? []).filter((file) => file.isOwned);

    if (ownedFiles.length > 0) {
      const normalizedDbHashes = dbHashes.map((hash) => hash.toLowerCase());
      const normalizedApiHashes = apiHashes.map((hash) => hash.toLowerCase());
      const dbHashSet = new Set(normalizedDbHashes);
      const apiHashSet = new Set(normalizedApiHashes);

      const addedHashes = normalizedApiHashes.filter((hash) => !dbHashSet.has(hash));
      const removedHashes = normalizedDbHashes.filter((hash) => !apiHashSet.has(hash));
      const ownedHashes = ownedFiles.map((file) => file.md5.toLowerCase());

      console.warn(
        `Warning: ${game.id} (${game.title}): one or more files are owned while hashes changed. ` +
        `Differences: added=${JSON.stringify(addedHashes)}, ` +
        `removed=${JSON.stringify(removedHashes)}, ` +
        `owned=${JSON.stringify(ownedHashes)}`,
      );
    }

    const files = await getFilesForGame(game.id);

    console.log(`Game ${game.title} (ID: ${game.id}) hash list changed. Refreshing files.`);
    await withTransaction(async (txQuery) => {
      await updateGame(platformId, game, txQuery);
      await replaceGameFiles(platformId, game.id, files, preservedRequiredHashes, preservedOwnedHashes, txQuery);
    });
  }
}

export async function processGames(): Promise<void> {
  const platforms = await getPlatforms();

  for (const platform of platforms) {
    const gameList = await getGameListForPlatform(platform.id, platform.name);

    for (const game of gameList) {
      if (shouldSkipInsertForTitle(game.title)) {
        // console.log(`Skipping game ${game.title} (ID: ${game.id}) early due to title filter.`);
        continue;
      }

      await upsertGame(platform.id, game);
    }
  }
}
