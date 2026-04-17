import { db } from "./src/db";
import { mints } from "./src/db/schema";

function normalizeBN(bnStr: string | any, decimals: number) {
  return Number(bnStr) / (10 ** decimals);
}

async function run() {
  const allMints = await db.select({ id: mints.id, name: mints.name, supply: mints.supply }).from(mints).limit(5);
  for (const m of allMints) {
    console.log(`Mint: ${m.name}, Raw Supply: ${m.supply.toString()}, Normalized: ${normalizeBN(m.supply, 6)}`);
  }
  process.exit(0);
}
run();
