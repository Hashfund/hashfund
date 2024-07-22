import "dotenv/config";
import BN from "bn.js";
import {
  clusterApiUrl,
  Connection,
  PublicKey,
  Transaction,
  ComputeBudgetProgram,
} from "@solana/web3.js";
import { NATIVE_MINT } from "@solana/spl-token";
import { safeBN, unsafeBN } from "@solocker/safe-bn";
import { simulateTransaction } from "@raydium-io/raydium-sdk-v2";

import { loadWallet } from "./utils";
import {
  createCheckedSwapInInstruction,
  getOrCreateAssociatedTokenAccountInstructions,
} from "../src";

const wallet = loadWallet("/Users/macbookpro/.config/solana/id.json");

const tokenAMint = new PublicKey(
  "9E28CTmSGfGftZBchBcRdK7ezXuphZk34Vmzf3CApruY"
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
    })
  );
  transaction.feePayer = wallet.publicKey;

  return simulateTransaction(connection, [transaction]);
}

async function main() {
  const connection = new Connection(clusterApiUrl("devnet"));
  const tx = await buySwap(connection, 1.50403938);
  console.log("tx=", tx);
}

main().catch(async (error) => {
  console.log(error);
  console.log(await error.getLogs());
});
