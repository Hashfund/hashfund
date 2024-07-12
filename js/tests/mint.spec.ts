import "dotenv/config";
import { BN } from "bn.js";
import { Connection, Transaction } from "@solana/web3.js";
import { NATIVE_MINT } from "@solana/spl-token";

import { loadWallet, loadWalletFromPriv } from "./utils";
import {
  createInitializeCurveInstruction,
  createMintInstruction,
  createSwapInInstruction,
  createSwapOutInstruction,
  HTTP_RPC_URL,
  parseLogs,
  SafeMath,
  SOL_USD_FEED,
} from "../src";
import { simulateTransaction } from "@raydium-io/raydium-sdk-v2";
import { Logs } from "@solana/web3.js";
import { PublicKey } from "@solana/web3.js";

const main = async () => {
  const connection: Connection = new Connection(HTTP_RPC_URL);
  const wallet = loadWallet("/Users/macbookpro/.config/solana/id.json");
  const [mint, instructions] = createMintInstruction({
    data: {
      name: "Test 1",
      ticker: "TEST 1",
      uri: "https://ik.imagekit.io/hashfund/tokens_metadata_BNvUnF4moZ4arrPYYdrEhjS64LUBHuABgrRJaXvLrLPe.json",
    },
    payer: wallet.publicKey,
  });

  console.log("mint={}", mint.toBase58());
  const transaction = new Transaction().add(...instructions).add(
    ...(await createInitializeCurveInstruction({
      connection,
      tokenAMint: mint,
      tokenBMint: NATIVE_MINT,
      payer: wallet.publicKey,
      solUsdFeed: SOL_USD_FEED,
      data: {
        supplyFraction: new BN(50),
        maximumMarketCap: new BN(512).mul(new BN(10).pow(new BN(9))),
      },
    })),
    createSwapInInstruction({
      connection,
      tokenAMint: mint,
      payer: wallet.publicKey,
      data: {
        amount: new BN(50).mul(new BN(10).pow(new BN(8))),
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
  connection.getFeeForMessage(transaction.compileMessage(), "finalized");
  const logs: Logs[] = await simulateTransaction(connection, [transaction]);
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
