import type { z } from "zod";
import { eq, max, min, sql, SQL, sum } from "drizzle-orm";

import { db } from "../../db";
import { swaps } from "../../db/schema";
import { first, interval, IntervalUnit, last } from "../../db/functions";
import type { insertSwapSchema } from "../../db/zod";

export const createSwap = (values: z.infer<typeof insertSwapSchema>) =>
  db.insert(swaps).values(values).returning().execute();

export const getSwaps = <TWhere extends SQL, TOrderBy extends SQL>(
  limit: number,
  offset: number,
  where?: TWhere,
  orderBy?: TOrderBy
) =>
  db.query.swaps
    .findMany({
      limit,
      offset,
      where,
      with: {
        payer: true,
      },
      columns: {
        id: true,
        pairAmount: true,
        tokenAmount: true,
        marketCap: true,
        mint: true,
        timestamp: true,
        signature: true,
        tradeDirection: true,
      },
    })
    .execute();

export const getSwapById = (id: string) =>
  db.query.swaps
    .findFirst({
      where: eq(swaps.id, id),
      with: {
        mint: true,
        payer: true,
      },
      columns: {
        id: true,
        marketCap: true,
        signature: true,
        timestamp: true,
        pairAmount: true,
        tokenAmount: true,
        tradeDirection: true,
        virtualPairBalance: true,
        virtualTokenBalance: true,
      },
    })
    .execute();

export const getSwapsGraph = <TWhere extends SQL>(
  limit: number,
  offset: number,
  resolution: IntervalUnit,
  duration: number,
  where?: TWhere
) =>
  db
    .select({
      open: first(swaps.virtualPairBalance),
      close: last(swaps.virtualPairBalance),
      high: max(swaps.virtualPairBalance),
      low: min(swaps.virtualPairBalance),
      time: interval(resolution, duration, swaps.timestamp).as("time"),
    })
    .from(swaps)
    .limit(limit)
    .offset(offset)
    .where(where)
    .orderBy(sql`time`)
    .groupBy(sql`time`);

export const getSwapsVolume = <TWhere extends SQL>(where?: TWhere) =>
  db
    .select({
      pairVolume: sum(swaps.pairAmount),
      tokenVolume: sum(swaps.tokenAmount),
      tradeDirection: swaps.tradeDirection,
    })
    .from(swaps)
    .where(where)
    .groupBy(swaps.mint, swaps.tradeDirection)
    .execute();
