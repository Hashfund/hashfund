import BN from "bn.js";
import {
  ComputeBudgetProgram,
  Connection,
  Keypair,
  PublicKey,
  sendAndConfirmTransaction,
  Transaction,
} from "@solana/web3.js";

import { loadWallet } from "./utils";
import { createHashTokenV2Instructions, HTTP_RPC_URL } from "../src";
import { simulateTransaction } from "@raydium-io/raydium-sdk-v2";

const mint = new PublicKey("DwJ8rwprNrKMzQP4PRnbkiubcLnnXndExP71Dr5LBgBf");

async function hashToken(connection: Connection, wallet: Keypair) {
  const ix0 = ComputeBudgetProgram.setComputeUnitLimit({
    units: 205_000,
  });
  const ix = await createHashTokenV2Instructions({
    connection,
    tokenBMint: mint,
    payer: wallet.publicKey,
    data: {
      openTime: new BN(0),
    },
  });

  const tx0 = new Transaction().add(ix0).add(...ix);

  tx0.feePayer = wallet.publicKey;

  console.log(await simulateTransaction(connection, [tx0]));
}

async function main() {
  const connection: Connection = new Connection(HTTP_RPC_URL);
  const wallet = loadWallet("/Users/macbookpro/.config/solana/id.json");

  await hashToken(connection, wallet);
}

main().catch(async (error) => {
  console.log(error);
  if (error.getLogs) {
    console.log(await error.getLogs());
  }
});
