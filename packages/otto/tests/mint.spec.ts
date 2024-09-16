import "dotenv/config";
import { BN } from "bn.js";
import { Connection, Logs, PublicKey, Transaction } from "@solana/web3.js";
import { NATIVE_MINT } from "@solana/spl-token";

import { loadWallet } from "./utils";
import {
  createInitializeCurveInstruction,
  createMintInstruction,
  createSwapInInstruction,
  createSwapOutInstruction,
  HTTP_RPC_URL,
  parseLogs,
  SOL_USD_FEED,
} from "../src";
import { simulateTransaction } from "@raydium-io/raydium-sdk-v2";

const main = async () => {
  const connection: Connection = new Connection(HTTP_RPC_URL);
  const wallet = loadWallet("/Users/macbookpro/.config/solana/id.json");
  const [mint, instructions] = createMintInstruction({
    data: {
      name: "Test 13",
      ticker: "TEST 1",
      uri: "https://ik.imagekit.io/hashfund/tokens_metadata_BNvUnF4moZ4arrPYYdrEhjS64LUBHuABgrRJaXvLrLPe.json",
    },
    payer: wallet.publicKey,
  });

  console.log("mint=", mint.toBase58());
  const transaction = new Transaction().add(...instructions).add(
    ...(await createInitializeCurveInstruction({
      connection,
      tokenAMint: mint,
      tokenBMint: NATIVE_MINT,
      payer: wallet.publicKey,
      solUsdFeed: SOL_USD_FEED,
      data: {
        supplyFraction: new BN(100),
        maximumMarketCap: new BN(5).mul(new BN(10).pow(new BN(5))),
      },
    })),
    createSwapInInstruction({
      connection,
      tokenAMint: mint,
      payer: wallet.publicKey,
      data: {
        amount: new BN(5).mul(new BN(10).pow(new BN(5))),
      },
    }),
    ...(await createSwapOutInstruction({
      connection,
      tokenAMint: mint,
      payer: wallet.publicKey,
      data: {
        amount: new BN(5).mul(new BN(10).pow(new BN(8))),
      },
    }))
  );
  transaction.feePayer = wallet.publicKey;
  const logs: Logs[] = await simulateTransaction(connection, [transaction]);
  console.log(logs);

  if (logs.some((log) => log.err)) logs.forEach((log) => console.log(log.err));

  logs
    .map(({ logs }) => parseLogs(logs))
    .forEach((events) =>
      events.map((event) =>
        console.log(
          JSON.stringify(
            event,
            (_, value) => {
              if (value instanceof PublicKey) {
                return value.toBase58();
              }

              if (value instanceof BN) {
                return value.toNumber();
              }

              return value;
            },
            2
          )
        )
      )
    );
};

main().catch(async (e) => {
  console.log(e);
  if (e.getLogs) console.log(await e.getLogs());
});
