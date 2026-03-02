import { config } from "dotenv";
import { join } from "path";
config({ path: join(__dirname, "../.env"), quiet: true });
import { processPlatforms } from "./sync/platforms";

async function main(): Promise<void> {
  await processPlatforms();
}

void main();