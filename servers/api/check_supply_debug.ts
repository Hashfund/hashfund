import { db } from "./src/db";
import { mints, boundingCurves } from "./src/db/schema";
import { eq } from "drizzle-orm";

async function run() {
  const result = await db
    .select({
      mintId: mints.id,
      mintSupply: mints.supply,
      bcInitialSupply: boundingCurves.initialSupply,
      bcVirtualTokenBalance: boundingCurves.virtualTokenBalance,
      bcLp: boundingCurves.liquidityPercentage
    })
    .from(mints)
    .leftJoin(boundingCurves, eq(mints.id, boundingCurves.mint))
    .limit(5);

  console.log(JSON.stringify(result, null, 2));
  process.exit(0);
}
run();
