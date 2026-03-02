import { config } from "dotenv";
import { join } from "path";
config({ path: join(__dirname, "../.env"), quiet: true });
import { syncPlatforms } from "./sync/platforms";

async function main(): Promise<void> {
  await syncPlatforms();
}

void main();