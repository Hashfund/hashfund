import { clusterApiUrl, Connection, PublicKey } from "@solana/web3.js";

import { SafeMath } from "../src/schema";
import { BoundingCurveInfo } from "../src/state";

async function main() {
  const connection = new Connection(clusterApiUrl("devnet"));
  const info = await connection.getAccountInfo(
    new PublicKey("GvejnBY9TvL7W4LD2cawEhMzBK9rvx31wFy3cNUwsjNV")
  );

  if (info) {
    let curve = BoundingCurveInfo.deserialize<BoundingCurveInfo>(info.data);
    console.log(SafeMath.unwrap(curve!.initial_price) / Math.pow(10, 9));
  }
}

main();
//694449755701*

/**
 * 0.15 = 1
 * 10000000 = x
 * 10000000 / 0.15
 * 
 * 
 */