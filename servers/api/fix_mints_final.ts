import { db } from "./src/db";
import { mints, boundingCurves } from "./src/db/schema";
import { eq } from "drizzle-orm";

async function run() {
  console.log("Starting FINAL supply synchronization...");
  
  const allMints = await db
    .select({
      id: mints.id,
      name: mints.name,
      currentSupply: mints.supply,
      initialSupply: boundingCurves.initialSupply,
      lpPercentage: boundingCurves.liquidityPercentage,
    })
    .from(mints)
    .innerJoin(boundingCurves, eq(mints.id, boundingCurves.mint))
    .execute();

  console.log(`Found ${allMints.length} mints with valid bounding curves.`);

  for (const mint of allMints) {
    try {
      const initialSupply = BigInt(mint.initialSupply);
      const lp = Number(mint.lpPercentage);
      
      if (lp <= 0) {
        console.warn(`[Skip] ${mint.name} (${mint.id}) has invalid LP: ${lp}`);
        continue;
      }

      // Formula: NominalSupply = InitialSupply / (LP / 100)
      // BigInt math: (InitialSupply * 100) / LP
      const calculatedNominal = (initialSupply * 100n) / BigInt(Math.round(lp));
      const currentSupply = BigInt(mint.currentSupply);

      // We use a string pattern check to see if it's the 10.8T bug
      const currentSupplyStr = mint.currentSupply.toString();
      const needsFix = calculatedNominal !== currentSupply || currentSupplyStr.startsWith("108235");

      if (needsFix) {
        console.log(`[Fixing] ${mint.name}:`);
        console.log(`  From: ${currentSupplyStr}`);
        console.log(`  To:   ${calculatedNominal.toString()}`);
        
        await db
          .update(mints)
          .set({ supply: calculatedNominal.toString() })
          .where(eq(mints.id, mint.id))
          .execute();
          
        console.log(`  Successfully synchronized.`);
      } else {
        console.log(`[OK] ${mint.name} already synchronized.`);
      }
    } catch (e: any) {
      console.error(`[Error] Failed to process ${mint.name}:`, e.message);
    }
  }

  console.log("Supply synchronization finished.");
  process.exit(0);
}

run().catch(err => {
  console.error("Critical error during migration:", err);
  process.exit(1);
});
