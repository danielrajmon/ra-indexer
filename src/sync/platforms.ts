import { getPlatforms as getPlatformsFromApi } from "../api/platforms";
import { getPlatformById, insertPlatform } from "../db/platforms";

export async function processPlatforms(): Promise<void> {
  const platforms = await getPlatformsFromApi();

  for (const platform of platforms) {
    const existingPlatform = await getPlatformById(platform.id);

    if (!existingPlatform) {
      console.log('Inserting platform', platform.name);

      await insertPlatform({
        id: platform.id,
        name: platform.name
      });
      return;
    }
  }
}
