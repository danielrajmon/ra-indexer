import { query, queryOne } from "./client";
import { Game } from "../types/game";

export async function getGameById(gameId: number): Promise<Game | null> {
  const result = await queryOne(`
    SELECT id, title, num_achievements, num_leaderboards, points, updated_at
      FROM games
     WHERE id = $1
  `, [gameId]);

  if (!result) return null;

  return {
    ...result,
    numAchievements: result.num_achievements,
    numLeaderboards: result.num_leaderboards,
    updatedAt: result.updated_at,
  };
}

export async function insertGame(platformId: number, game: Game): Promise<void> {
  await query(`
    INSERT INTO games
      (id, platform_id, title, num_achievements, num_leaderboards, points, updated_at)
    VALUES
      ($1, $2, $3, $4, $5, $6, NOW())
  `, [game.id, platformId, game.title, game.numAchievements, game.numLeaderboards, game.points]);
}


export async function updateGame(platformId: number, game: Game): Promise<void> {
  await query(`
    UPDATE games
       SET title = $2,
           num_achievements = $3,
           num_leaderboards = $4,
           points = $5,
           updated_at = NOW()
     WHERE id = $1
       AND platform_id = $6
  `, [game.id, game.title, game.numAchievements, game.numLeaderboards, game.points, platformId]);
}