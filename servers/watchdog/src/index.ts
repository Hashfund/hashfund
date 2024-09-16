import { Connection, type Logs } from "@solana/web3.js";
import { HASHFUND_PROGRAM_ID, SafeMath, parseLogs } from "@hashfund/program";

import hashfund from "@hashfund/api";
import { HTTP_RPC_ENDPOINT, WSS_RPC_ENDPOINT } from "./config";

const {
  createMint,
  updateMint,
  getOrCreateUser,
  createBoundingCurve,
  createSwap,
  createHash,
} = hashfund;



export const onLogs = async ({ logs, signature }: Logs) => {
  const events = parseLogs(logs);

  for (const event of events) {
    if (event.Mint && event.MintTo) {
      let mintData = event.Mint;
      let mintToData = event.MintTo;

      await getOrCreateUser(mintData.creator.toBase58());

      await createMint({
        id: mintData.mint.toBase58(),
        name: mintData.name,
        creator: mintData.creator.toBase58(),
        uri: mintData.uri,
        ticker: mintData.ticker,
        timestamp: new Date(),
        reserve: mintToData.reserve.toBase58(),
        totalSupply: mintToData.amount.toString("hex"),
        signature,
      });

      continue;
    }

    if ("InitializeCurve" in event && event.InitializeCurve) {
      const data = event.InitializeCurve;

      await createBoundingCurve({
        id: data.bounding_curve.toBase58(),
        mint: data.mint.toBase58(),
        initialMarketCap: data.initial_market_cap.toString("hex"),
        curveInitialSupply: data.curve_initial_supply.toString("hex"),
        initialPrice: String(SafeMath.unwrap(data.initial_price)),
        maximumMarketCap: data.maximum_market_cap.toString("hex"),
        timestamp: new Date(),
        signature,
      });

      continue;
    }

    if ("Swap" in event && event.Swap) {
      const data = event.Swap;

      await getOrCreateUser(data.payer.toBase58());

      await createSwap({
        mint: data.mint.toBase58(),
        tradeDirection: data.trade_direction,
        amountIn: data.amount_in.toString("hex"),
        amountOut: data.amount_out.toString("hex"),
        marketCap: data.market_cap.toString("hex"),
        virtualMarketCap: data.virtual_market_cap.toString("hex"),
        timestamp: new Date(),
        payer: data.payer.toBase58(),
        signature,
      });

      continue;
    }

    if ("HashMature" in event && event.HashMature) {
      const data = event.HashMature;

      await updateMint(data.mint.toBase58(), {
        canTrade: false,
      });

      continue;
    }

    if ("HashToken" in event && event.HashToken) {
      const data = event.HashToken;
      if (data.market)
        await createHash({
          marketId: data.market.toBase58(),
          mint: data.token_a_mint.toBase58(),
          ammId: data.amm.toBase58(),
          timestamp: new Date(),
        });
      else
        await createHash({
          mint: data.token_b_mint.toBase58(),
          ammId: data.amm.toBase58(),
          timestamp: new Date(),
        });

      continue;
    }
  }
};

async function run() {
  const connection = new Connection(HTTP_RPC_ENDPOINT, {
    wsEndpoint: WSS_RPC_ENDPOINT,
  });

  connection.onLogs(
    HASHFUND_PROGRAM_ID,
    async (logs) => {
      console.log("signature=", logs.signature);

      onLogs(logs).catch(console.log);
    },
    "confirmed"
  );
}

run()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .then(() => console.log("Running worker in background..."));
