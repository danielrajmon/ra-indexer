import { Platform } from "../types/platforms";
import { getPlatforms as getPlatformsFromApi } from "../api/platforms";
import { getPlatformById, insertPlatform, updatePlatform } from "../db/platforms";

async function syncPlatform(platform: Platform): Promise<void> {
  const existingPlatform = await getPlatformById(platform.id);

  if (!existingPlatform) {
    await insertPlatform({
      id: platform.id,
      name: platform.name,
      active: platform.active
    });
    return;
  }

  if (existingPlatform.name !== platform.name || existingPlatform.active !== platform.active) {
    await updatePlatform({
      id: platform.id,
      name: platform.name,
      active: platform.active
    });
  }
}

export async function processPlatforms(): Promise<void> {
  const platforms = await getPlatformsFromApi();

  for (const platform of platforms) {
    await syncPlatform(platform);
  }
}
