import type { z } from "zod";
import { TradeDirection } from "@hashfund/zeroboost";
import { and, count, eq, getTableColumns, SQL, sum } from "drizzle-orm";

import { db } from "../../db";
import { boundingCurves, mints, swaps } from "../../db/schema";
import { caseWhen, coalesce } from "../../db/functions";
import type { insertMintSchema, updateMintSchema } from "../../db/zod";

export const createMint = (values: z.infer<typeof insertMintSchema>) =>
  db.insert(mints).values(values).returning().execute();

export const updateMint = (values: Partial<z.infer<typeof updateMintSchema>>) =>
  db.update(mints).set(values).returning().execute();

/**
 * FAIL-SAFE: Automatically corrects 10,000x scaling errors for token quantities.
 * This is a safety valve for the 10.8T supply bug.
 */
function fixValue(val: any): string {
  if (!val) return val;
  const s = String(val);
  // If the value is > 10^18 (Quintillion), it's likely a 10,000x inflated 1 Billion supply (which is 10^15 normally)
  if (s.length >= 19) {
    try {
      const bigint = BigInt(s);
      return (bigint / BigInt(10000)).toString();
    } catch {
      return s;
    }
  }
  return s;
}

function fixMint(mint: any) {
  if (!mint) return mint;
  if (mint.supply) mint.supply = fixValue(mint.supply);
  if (mint.boundingCurve) {
    if (mint.boundingCurve.initialSupply) 
      mint.boundingCurve.initialSupply = fixValue(mint.boundingCurve.initialSupply);
    if (mint.boundingCurve.virtualTokenBalance) 
      mint.boundingCurve.virtualTokenBalance = fixValue(mint.boundingCurve.virtualTokenBalance);
  }
  return mint;
}

export const getMints = async <TWhere extends SQL, TOrderBy extends SQL>(
  limit: number,
  offset: number,
  where?: TWhere,
  orderBy?: TOrderBy
) => {
  const qSwap = db.$with("qSwap").as(
    db
      .select({
        mint: swaps.mint,
        pairVolume: sum(swaps.pairAmount).as("pair_amount"),
        tokenVolume: sum(swaps.tokenAmount).as("token_amount"),
        buyVolume: caseWhen(
          eq(swaps.tradeDirection, TradeDirection.BtoA),
          sum(swaps.pairAmount)
        ).as("buy_volume"),
        sellVolume: caseWhen(
          eq(swaps.tradeDirection, TradeDirection.AtoB),
          sum(swaps.pairAmount)
        ).as("sell_volume"),
        count: count(swaps.id).as("count"),
      })
      .from(swaps)
      .groupBy(swaps.mint, swaps.tradeDirection)
  );

  const query = db
    .with(qSwap)
    .select({
      ...getTableColumns(mints),
      boundingCurve: getTableColumns(boundingCurves),
      market: {
        txnCount: sum(qSwap.count).mapWith(Number),
        buyVolume: coalesce(sum(qSwap.buyVolume), 0).mapWith(BigInt),
        sellVolume: coalesce(sum(qSwap.sellVolume), 0).mapWith(BigInt),
        pairVolume: coalesce(sum(qSwap.pairVolume), 0).mapWith(BigInt),
        tokenVolume: coalesce(sum(qSwap.tokenVolume), 0).mapWith(BigInt),
      },
    })
    .from(mints)
    .limit(limit)
    .offset(offset)
    .where(where)
    .leftJoin(qSwap, eq(qSwap.mint, mints.id))
    .innerJoin(boundingCurves, eq(boundingCurves.mint, mints.id))
    .groupBy(mints.id, qSwap.mint, boundingCurves.id);

  const results = await (orderBy ? query.orderBy(orderBy).execute() : query.execute());
  return results.map(fixMint);
};

export const getMintById = async (id: string) => {
  const qSwap = db.$with("qSwap").as(
    db
      .select({
        mint: swaps.mint,
        pairVolume: sum(swaps.pairAmount).as("pair_amount"),
        tokenVolume: sum(swaps.tokenAmount).as("token_amount"),
        buyVolume: caseWhen(
          eq(swaps.tradeDirection, TradeDirection.BtoA),
          sum(swaps.pairAmount)
        ).as("buy_volume"),
        sellVolume: caseWhen(
          eq(swaps.tradeDirection, TradeDirection.AtoB),
          sum(swaps.pairAmount)
        ).as("sell_volume"),
        count: count(swaps.id).as("count"),
      })
      .from(swaps)
      .where(eq(swaps.mint, id))
      .groupBy(swaps.mint, swaps.tradeDirection)
  );

  const results = await db
    .with(qSwap)
    .select({
      ...getTableColumns(mints),
      boundingCurve: getTableColumns(boundingCurves),
      market: {
        txnCount: sum(qSwap.count).mapWith(Number),
        buyVolume: coalesce(sum(qSwap.buyVolume), 0).mapWith(BigInt),
        sellVolume: coalesce(sum(qSwap.sellVolume), 0).mapWith(BigInt),
        pairVolume: coalesce(sum(qSwap.pairVolume), 0).mapWith(BigInt),
        tokenVolume: coalesce(sum(qSwap.tokenVolume), 0).mapWith(BigInt),
      },
    })
    .from(mints)
    .where(eq(mints.id, id))
    .leftJoin(qSwap, eq(qSwap.mint, mints.id))
    .innerJoin(boundingCurves, eq(boundingCurves.mint, mints.id))
    .groupBy(mints.id, qSwap.mint, boundingCurves.id)
    .execute();

  return fixMint(results[0]);
};

export const getMintsByUser = (user: string, limit: number, offset: number) => {
  const qSwaps = db
    .$with("qSwaps")
    .as(db.selectDistinctOn([swaps.payer]).from(swaps));
  return db
    .with(qSwaps)
    .selectDistinctOn([mints.id], getTableColumns(mints))
    .from(mints)
    .limit(limit)
    .offset(offset)
    .innerJoin(qSwaps, and(eq(qSwaps.mint, mints.id), eq(qSwaps.payer, user)))
    .execute();
};
