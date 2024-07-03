import "dotenv/config";
import BN from "bn.js";
import {
  clusterApiUrl,
  Connection,
  PublicKey,
  sendAndConfirmTransaction,
  Transaction,
} from "@solana/web3.js";

import { loadWallet, loadWalletFromPriv } from "./utils";
import {
  createInitializeCurveInstruction,
  createSwapInInstruction,
  createSwapOutInstruction,
  SOL_USD_FEED,
} from "../src";
import {
  createAssociatedTokenAccountInstruction,
  NATIVE_MINT,
} from "@solana/spl-token";
import { safeBN, unsafeBN } from "@solocker/safe-bn";
import { simulateTransaction } from "@raydium-io/raydium-sdk-v2";

const wallet = loadWallet("/Users/macbookpro/.config/solana/id.json");

const tokenAMint = new PublicKey(
  "CfuNBEecdeL4enSsMVr5Y5pv2jUC5geFJPwMkj89G2J7"
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

  return simulateTransaction(connection, [transaction]);
}

async function buySwap(connection: Connection, amount: number) {
  const transaction = new Transaction();
  transaction.add(
    createAssociatedTokenAccountInstruction(
      wallet.publicKey,
      new PublicKey("HZALaPDW1ykbnHgtKr7ZpNFCp8w69p4M34J9fhLSHynS"),
      wallet.publicKey,
      tokenAMint
    ),
    createSwapInInstruction({
      connection,
      tokenAMint,
      tokenBMint,
      payer: wallet.publicKey,
      data: {
        amount: unsafeBN(safeBN(amount).mul(new BN(10).pow(new BN(9)))),
      },
    })
  );
  transaction.feePayer = wallet.publicKey;

  return simulateTransaction(connection, [transaction]);
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

  transaction.feePayer = wallet.publicKey;

  return simulateTransaction(connection, [transaction]);
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
