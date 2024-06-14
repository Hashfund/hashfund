import { clusterApiUrl, Connection, PublicKey } from "@solana/web3.js";
import { BoundingCurveInfo } from "../src/state";
import BN from "bn.js";

async function main() {
  const connection = new Connection(clusterApiUrl("devnet"));
  const info = await connection.getAccountInfo(
    new PublicKey("A6T2Mmv1S5FvtGVqZxCMbMknMcYYN1V4NLFmt3uPLwoS")
  );

  if (info) {
    let curve = BoundingCurveInfo.deserialize<BoundingCurveInfo>(info.data);
    console.log(curve)
  }
}

main();
