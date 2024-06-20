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
} from "../src";
import { NATIVE_MINT } from "@solana/spl-token";

let wallet = loadWallet("/Users/macbookpro/.config/solana/id.json");
const tokenAMint = new PublicKey(
  "CwQHh94564GpUt3WXj8prnP6E6ARPC5JCpEcf6TEosdu"
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
      data: {
        initialBuyAmount: new BN(1).mul(new BN(10).pow(new BN(9))),
        maximumMarketCap: new BN(4).mul(new BN(10).pow(new BN(9))),
      },
    }))
  );

  return sendAndConfirmTransaction(connection, transaction, [wallet], {
    commitment: "finalized",
  });
}

async function buySwap(connection: Connection) {
  const transaction = new Transaction();
  transaction.add(
    createSwapInInstruction({
      connection,
      tokenAMint,
      tokenBMint,
      payer: wallet.publicKey,
      data: {
        amount: new BN(5).mul(new BN(10).pow(new BN(8))),
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
        amount: new BN(10_361_000).mul(new BN(10).pow(new BN(6))),
      },
    }))
  );

  return sendAndConfirmTransaction(connection, transaction, [wallet]);
}

async function main() {
  const connection = new Connection(clusterApiUrl("devnet"));
  const tx = await buySwap(connection);
  console.log("tx=", tx);
}

main().catch(async (error) => {
  console.log(error);
  console.log(await error.getLogs());
});
