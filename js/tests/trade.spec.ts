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
  createCheckedSwapInInstruction,
  createInitializeCurveInstruction,
  createSwapInInstruction,
  createSwapOutInstruction,
  getOrCreateAssociatedTokenAccountInstructions,
  SOL_USD_FEED,
} from "../src";
import {
  createAssociatedTokenAccountInstruction,
  getOrCreateAssociatedTokenAccount,
  NATIVE_MINT,
} from "@solana/spl-token";
import { safeBN, unsafeBN } from "@solocker/safe-bn";
import { simulateTransaction } from "@raydium-io/raydium-sdk-v2";

const wallet = loadWallet("/Users/macbookpro/.config/solana/id.json");

const tokenAMint = new PublicKey(
  "FV6aMnvMHU3PK9MTda57gcrkk8Xh9MGYB9mUx8NAH2wQ"
);
const tokenBMint = NATIVE_MINT;


async function buySwap(connection: Connection, amount: number) {
  const transaction = new Transaction();
  transaction.add(
    ...(await getOrCreateAssociatedTokenAccountInstructions(
      connection,
      tokenAMint,
      wallet.publicKey,
      wallet.publicKey,
      false
    )),
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


async function main() {
  const connection = new Connection(clusterApiUrl("devnet"));
  const tx = await buySwap(connection, 0.000000001);
  console.log("tx=", tx);
}

main().catch(async (error) => {
  console.log(error);
  console.log(await error.getLogs());
});
