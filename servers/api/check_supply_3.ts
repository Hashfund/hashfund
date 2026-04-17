import { db } from "./src/db";
import { mints, boundingCurves } from "./src/db/schema";
import { eq, desc } from "drizzle-orm";

function normalizeBN(bnStr: string | any, decimals: number) {
  return Number(bnStr) / (10 ** decimals);
}

async function run() {
  const allMints = await db
    .select({ 
      id: mints.id, 
      name: mints.name, 
      supply: mints.supply,
      initialSupply: boundingCurves.initialSupply
    })
    .from(mints)
    .leftJoin(boundingCurves, eq(mints.id, boundingCurves.id))
    .orderBy(desc(mints.createdAt))
    .limit(5);

  for (const m of allMints) {
    console.log(`Mint: ${m.name}`);
    console.log(`  Raw Supply: ${m.supply.toString()}`);
    console.log(`  Normalized: ${normalizeBN(m.supply, 6)}`);
    if (m.initialSupply) {
      console.log(`  Raw InitialSupply: ${m.initialSupply.toString()}`);
      console.log(`  Normalized InitialSupply: ${normalizeBN(m.initialSupply, 6)}`);
    } else {
      console.log(`  No bounding curve`);
    }
    console.log('---');
  }
  process.exit(0);
}
run();
