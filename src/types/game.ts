export type Game = {
  title: string;
  id: number;
  numAchievements: number;
  numLeaderboards: number;
  points: number;
  hashes?: string[];
  updatedAt?: string | Date;
};