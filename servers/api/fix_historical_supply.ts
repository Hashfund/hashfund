import { db } from "./src/db";
import { mints, boundingCurves } from "./src/db/schema";
import { eq } from "drizzle-orm";

async function run() {
  console.log("Starting historical supply migration...");
  
  const records = await db
    .select({
      mintId: mints.id,
      mintName: mints.name,
      currentSupply: mints.supply,
      initialSupply: boundingCurves.initialSupply,
      lp: boundingCurves.liquidityPercentage
    })
    .from(mints)
    .leftJoin(boundingCurves, eq(mints.id, boundingCurves.mint))
    .execute();

  console.log(`Found ${records.length} total mints in DB.`);
  console.log("Mints found:", records.map(r => `${r.mintName} (${r.mintId})`).join(", "));

  for (const record of records) {
    if (!record.initialSupply || !record.lp) {
        console.log(`Skipping ${record.mintName} (${record.mintId}) - no bounding curve data.`);
        continue;
    }
    const initialSupply = BigInt(record.initialSupply);
    const lp = Math.round(Number(record.lp));
    
    if (lp === 0) {
        console.warn(`Skipping ${record.mintName} (${record.mintId}) due to 0 LP.`);
        continue;
    }

    // nominal = initial / (lp/100) => nominal = initial * 100 / lp
    const calculatedNominal = (initialSupply * 100n) / BigInt(lp);
    const currentSupplyString = String(record.currentSupply);
    const currentSupply = BigInt(record.currentSupply);

    console.log(`Checking ${record.mintName}: calc=${calculatedNominal}, curr=${currentSupply}, lp=${lp}, init=${initialSupply}`);

    // Force fix if it matches the 10.8T inflated pattern or is just plain wrong
    const isInflated = currentSupplyString.startsWith("108235") || currentSupplyString.startsWith("1082");
    
    if (calculatedNominal !== currentSupply || isInflated) {
      console.log(`Fixing ${record.mintName} (${record.mintId}):`);
      console.log(`  Current:    ${currentSupplyString}`);
      console.log(`  Calculated: ${calculatedNominal.toString()}`);
      
      await db
        .update(mints)
        .set({ supply: calculatedNominal.toString() })
        .where(eq(mints.id, record.mintId))
        .execute();
        
      console.log(`  Update complete.`);
    } else {
      console.log(`Mint ${record.mintName} is already correct.`);
    }
  }

  console.log("Migration finished.");
  process.exit(0);
}

run().catch(err => {
  console.error("Migration failed:", err);
  process.exit(1);
});
