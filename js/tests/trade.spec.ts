import BN from "bn.js";
import {
  clusterApiUrl,
  Connection,
  PublicKey,
  sendAndConfirmTransaction,
  Transaction,
} from "@solana/web3.js";

import { InitializeCurveSchema, SwapSchema } from "../src/schema";
import { loadWallet } from "../src/utils";
import {
  createInitializeCurveInstruction,
  createSwapInInstruction,
  createSwapOutInstruction,
} from "../src";
import { NATIVE_MINT } from "@solana/spl-token";

let wallet = loadWallet("/Users/macbookpro/.config/solana/id.json");
const tokenAMint = new PublicKey(
  "G7xfyXafiVXj7V2zRrRntnPEepV3oYXjbjmBGVwji72k"
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
      data: new InitializeCurveSchema(
        new BN(1).mul(new BN(10).pow(new BN(9))),
        new BN(4).mul(new BN(10).pow(new BN(9)))
      ),
    }))
  );

  return sendAndConfirmTransaction(connection, transaction, [wallet]);
}

async function buySwap(connection: Connection) {
  const transaction = new Transaction();
  transaction.add(
    createSwapInInstruction({
      tokenAMint,
      tokenBMint,
      payer: wallet.publicKey,
      data: new SwapSchema(new BN(1).mul(new BN(10).pow(new BN(9))), 0),
    })
  );

  return sendAndConfirmTransaction(connection, transaction, [wallet]);
}

async function sellSwap(connection: Connection) {
  const transaction = new Transaction();
  transaction.add(
    createSwapOutInstruction({
      tokenAMint,
      tokenBMint,
      payer: wallet.publicKey,
      data: new SwapSchema(new BN(1).mul(new BN(10).pow(new BN(9))), 1),
    })
  );

  return sendAndConfirmTransaction(connection, transaction, [wallet]);
}

async function main() {
  const connection = new Connection(clusterApiUrl("devnet"));
  const tx = await initializeCurve(connection);
  console.log("tx=", tx);
}

// main().catch(async (error) => {
//   console.log(error);
//   console.log(await error.getLogs());
// });
