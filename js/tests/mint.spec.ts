import { BN } from "bn.js";
import {
  Connection,
  sendAndConfirmTransaction,
  Transaction,
} from "@solana/web3.js";
import { NATIVE_MINT } from "@solana/spl-token";

import { loadWallet } from "./utils";
import {
  createInitializeCurveInstruction,
  createMintInstruction,
  createSwapInInstruction,
  HTTP_RPC_URL,
  SOL_USD_FEED,
} from "../src";
import { simulateTransaction } from "@raydium-io/raydium-sdk-v2";

const main = async () => {
  const connection: Connection = new Connection(HTTP_RPC_URL);
  const wallet = loadWallet("/Users/macbookpro/.config/solana/id.json");

  const [mint, instructions] = createMintInstruction({
    data: {
      name: "Test",
      ticker: "TEST",
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
        supplyFraction: new BN(10),
        maximumMarketCap: new BN(5).mul(new BN(10).pow(new BN(9))),
      },
    })),
    createSwapInInstruction({
      connection,
      tokenAMint: mint,
      payer: wallet.publicKey,
      data: {
        amount: new BN(2).mul(new BN(10).pow(new BN(9))),
      },
    })
  );
  transaction.feePayer = wallet.publicKey;
  // const tx = await simulateTransaction(connection, [transaction]);
  const tx = await sendAndConfirmTransaction(connection, transaction, [wallet]);
  console.log("tx={}", tx);
};

main().catch(async (e) => {
  console.log(e);
  if (e.getLogs) console.log(await e.getLogs());
});
