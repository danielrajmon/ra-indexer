import { getPlatforms as getPlatformsFromApi } from "../api/platforms";
import { getPlatformById } from "../db/platforms";

export async function syncPlatforms(): Promise<void> {
  const platforms = await getPlatformsFromApi();

  for (const platform of platforms) {
    const existingPlatform = await getPlatformById(platform.id);
    console.log(existingPlatform);
  }
}