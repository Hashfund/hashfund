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

describe("mint token to a reserve", () => {
  let connection: Connection;
  let wallet = loadWallet("/Users/macbookpro/.config/solana/id.json");

  beforeAll(() => {
    connection = new Connection(clusterApiUrl("devnet"));
  });

  test("Should mint a permissionless token", async () => {
    const [mint, instructions] = await createMintInstruction(
      connection,
      {
        name: "hashfund #5",
        ticker: "Hash",
        uri: "https://hashfund.io/public.json",
        decimals: 9,
        totalSupply: new BN(1_000_000),
      },
      wallet
    );

    console.log("mint={}", mint.toBase58());
    const transaction = new Transaction().add(...instructions);
    const tx = await sendAndConfirmTransaction(connection, transaction, [
      wallet,
    ]);

    console.log("tx={}", tx);
  });
});
