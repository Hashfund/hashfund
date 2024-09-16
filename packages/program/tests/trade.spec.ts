import "dotenv/config";
import BN from "bn.js";
import {
  clusterApiUrl,
  Connection,
  PublicKey,
  ComputeBudgetProgram,
} from "@solana/web3.js";
import {
  NATIVE_MINT,
  TOKEN_2022_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { safeBN, unsafeBN } from "@hashfund/bn";

import { loadWallet } from "./utils";
import {
  createCheckedSwapInInstruction,
  getOrCreateAssociatedTokenAccountInstructions,
} from "../src";
import { TransactionMessage } from "@solana/web3.js";
import { VersionedTransaction } from "@solana/web3.js";

export const isTokenAccount = (owner: PublicKey) =>
  TOKEN_PROGRAM_ID.equals(owner) || TOKEN_2022_PROGRAM_ID.equals(owner);

const wallet = loadWallet("/Users/macbookpro/.config/solana/id.json");

const tokenAMint = new PublicKey(
  "9E28CTmSGfGftZBchBcRdK7ezXuphZk34Vmzf3CApruY"
);
const tokenBMint = NATIVE_MINT;

async function buySwap(connection: Connection, amount: number) {
  const ix = [
    ...(await getOrCreateAssociatedTokenAccountInstructions(
      connection,
      tokenAMint,
      wallet.publicKey,
      wallet.publicKey,
      false
    )),
    ComputeBudgetProgram.setComputeUnitLimit({
      units: 300_000,
    }),
    createCheckedSwapInInstruction({
      connection,
      tokenAMint,
      tokenBMint,
      payer: wallet.publicKey,
      data: {
        amount: unsafeBN(safeBN(amount).mul(new BN(10).pow(new BN(9)))),
      },
    }),
  ];

  const lastestBlockHash = connection.getLatestBlockhash();

  const message = new TransactionMessage({
    payerKey: wallet.publicKey,
    recentBlockhash: (await lastestBlockHash).blockhash,
    instructions: ix,
  }).compileToV0Message();

  const transaction = new VersionedTransaction(message);

  return connection.simulateTransaction(transaction);
}

async function main() {
  const connection = new Connection(clusterApiUrl("devnet"));
  const tx = await buySwap(connection, 1.5);
  console.log("tx=", tx);
}

main().catch(async (error) => {
  console.log(error);
  console.log(await error.getLogs());
});
