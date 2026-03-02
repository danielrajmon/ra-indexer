import { config } from "dotenv";
import { join } from "path";
import { syncPlatforms } from "./sync/platforms";

config({ path: join(__dirname, "../.env"), quiet: true });

async function main(): Promise<void> {
  await syncPlatforms();
}

void main();