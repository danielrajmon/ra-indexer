import { getPlatforms as getPlatformsFromApi } from "../api/platforms";

export async function syncPlatforms(): Promise<void> {
  const platforms = await getPlatformsFromApi();
  console.log("Platforms:", platforms);
}