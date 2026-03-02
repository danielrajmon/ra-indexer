import { getPlatforms } from "../db/platforms";

export async function processGames(): Promise<void> {
  const platforms = await getPlatforms();

  console.log(`Processing games for ${platforms.length} platforms...`);
}
