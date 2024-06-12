import { BN } from "bn.js";
import { test, describe, beforeAll } from "bun:test";
import {
  clusterApiUrl,
  Connection,
  sendAndConfirmTransaction,
  Transaction,
} from "@solana/web3.js";
import { loadWallet } from "../src/utils";
import { createMintInstruction } from "../src";

const main = async () => {
  const connection: Connection = new Connection(clusterApiUrl("devnet"));
  const wallet = loadWallet("/Users/macbookpro/.config/solana/id.json");

  const [mint, instructions] = await createMintInstruction({
    name: "hashfund #1",
    ticker: "Hash",
    uri: "https://hashfund.io/public.json",
    decimals: 9,
    totalSupply: new BN(1_000_000),
    payer: wallet.publicKey,
  });

  console.log("mint={}", mint.toBase58());
  const transaction = new Transaction().add(...instructions);
  const tx = await sendAndConfirmTransaction(connection, transaction, [wallet]);

  console.log("tx={}", tx);
};

main().catch(async (e) => {
  console.log(e);
  console.log(await e.getLogs());
});
