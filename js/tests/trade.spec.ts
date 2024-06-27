import "dotenv/config";
import BN from "bn.js";
import {
  clusterApiUrl,
  Connection,
  PublicKey,
  sendAndConfirmTransaction,
  Transaction,
} from "@solana/web3.js";

import { loadWallet} from "./utils";
import {
  createInitializeCurveInstruction,
  createSwapInInstruction,
  createSwapOutInstruction,
  SOL_USD_FEED,
} from "../src";
import { NATIVE_MINT } from "@solana/spl-token";

let wallet = loadWallet("/Users/macbookpro/.config/solana/id.json");
const tokenAMint = new PublicKey(
  "64VnzwzgMxLBnnWwWQapeRV2C6y63okxdDqU97NCK6gG"
);
const tokenBMint = NATIVE_MINT;

async function initializeCurve(connection: Connection) {
  const transaction = new Transaction();
  transaction.add(
    ...(await createInitializeCurveInstruction({
      connection,
      tokenAMint,
      tokenBMint,
      payer: wallet.publicKey,
      solUsdFeed: SOL_USD_FEED,
      data: {
        supplyFraction: new BN(10),
        maximumMarketCap: new BN(4).mul(new BN(10).pow(new BN(9))),
      },
    }))
  );

  return sendAndConfirmTransaction(connection, transaction, [wallet], {
    commitment: "finalized",
  });
}

async function buySwap(connection: Connection, amount: number) {
  const transaction = new Transaction();
  transaction.add(
    createSwapInInstruction({
      connection,
      tokenAMint,
      tokenBMint,
      payer: wallet.publicKey,
      data: {
        amount: new BN(amount).mul(new BN(10).pow(new BN(9))),
      },
    })
  );

  return sendAndConfirmTransaction(connection, transaction, [wallet], {
    commitment: "finalized",
  });
}

async function sellSwap(connection: Connection) {
  const transaction = new Transaction();
  transaction.add(
    ...(await createSwapOutInstruction({
      connection,
      tokenAMint,
      tokenBMint,
      payer: wallet.publicKey,
      data: {
        amount: new BN(5_000_000).mul(new BN(10).pow(new BN(6))),
      },
    }))
  );

  return sendAndConfirmTransaction(connection, transaction, [wallet]);
}

async function main() {
  const connection = new Connection(clusterApiUrl("devnet"));
  const tx = await buySwap(connection, 1);
  console.log("tx=", tx);
}

main().catch(async (error) => {
  console.log(error);
  console.log(await error.getLogs());
});
