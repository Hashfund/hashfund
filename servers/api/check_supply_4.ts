import { db } from "./src/db";
import { mints, boundingCurves } from "./src/db/schema";
import { ne } from "drizzle-orm";

function normalizeBN(bnStr: string | any, decimals: number) {
  return Number(bnStr) / (10 ** decimals);
}

async function run() {
  const allMints = await db
    .select({ 
      id: mints.id, 
      name: mints.name, 
      supply: mints.supply
    })
    .from(mints)
    .where(ne(mints.supply, "10000000000000000000"));

  for (const m of allMints) {
    console.log(`Mint: ${m.name}`);
    console.log(`  Raw Supply: ${m.supply.toString()}`);
    console.log(`  Normalized: ${normalizeBN(m.supply, 6)}`);
    console.log('---');
  }
  process.exit(0);
}
run();
