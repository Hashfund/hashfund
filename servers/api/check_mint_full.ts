import { db } from "./src/db";
import { mints, boundingCurves } from "./src/db/schema";
import { eq } from "drizzle-orm";

async function run() {
  const firstMint = await db
    .select()
    .from(mints)
    .leftJoin(boundingCurves, eq(mints.id, boundingCurves.mint))
    .limit(1);

  console.log(JSON.stringify(firstMint, null, 2));
  process.exit(0);
}
run();
