import BN from "bn.js";
import {
  clusterApiUrl,
  Connection,
  Keypair,
  PublicKey,
  Transaction,
} from "@solana/web3.js";

import { loadWallet } from "./utils";
import { createHashTokenV2Instructions } from "../src";
import { simulateTransaction } from "@raydium-io/raydium-sdk-v2";

const mint = new PublicKey("BS5a91MfRZgRWe4wTGTGZX87kRNuwvGNdRSPi4NzDt2n");

async function hashToken(connection: Connection, wallet: Keypair) {
  const ix = createHashTokenV2Instructions({
    tokenAMint: mint,
    payer: wallet.publicKey,
    data: {
      openTime: new BN(0),
    },
  });

  const tx0 = new Transaction().add(ix);

  tx0.feePayer = wallet.publicKey;

  console.log(await simulateTransaction(connection, [tx0]));
}

async function main() {
  const connection: Connection = new Connection(clusterApiUrl("devnet"));
  const wallet = loadWallet("/Users/macbookpro/.config/solana/id.json");

  await hashToken(connection, wallet);
}

main().catch(async (error) => {
  console.log(error);
  if (error.getLogs) {
    console.log(await error.getLogs());
  }
});
