import { config } from "dotenv";
import { join } from "path";
config({ path: join(__dirname, "../.env"), quiet: true });
import { processPlatforms } from "./sync/platforms";
import { processGames } from "./sync/games";

async function main(): Promise<void> {
  await processPlatforms();
  await processGames();
}

void main();