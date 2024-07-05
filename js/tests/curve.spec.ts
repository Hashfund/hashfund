import { clusterApiUrl, Connection, PublicKey } from "@solana/web3.js";
import { BoundingCurveInfo } from "../src/state";
import BN from "bn.js";

async function main() {
  const connection = new Connection(clusterApiUrl("devnet"));
  const info = await connection.getAccountInfo(
    new PublicKey("7u4sgS4hfw2TJY2FeQw36jf3XfrPRSGpiJPjiVHHttTK")
  );
  console.log(info)

  if (info) {
    let curve = BoundingCurveInfo.deserialize<BoundingCurveInfo>(info.data);
    console.log(curve?.maximum_market_cap.div(new BN(10).pow(new BN(9))).toNumber())
  }
}

main();
