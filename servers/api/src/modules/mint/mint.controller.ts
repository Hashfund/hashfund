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

export const getMints = <TWhere extends SQL, TOrderBy extends SQL>(
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

  return orderBy ? query.orderBy(orderBy).execute() : query.execute();
};

export const getMintById = (id: string) =>
  db.query.mints
    .findFirst({
      where: eq(mints.id, id),
      with: {
        boundingCurve: true,
      },
    })
    .execute();

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
