import type { z } from "zod";
import { avg, eq, SQL, sum } from "drizzle-orm";

import { db } from "../../db";
import { swaps } from "../../db/schema";
import { extract } from "../../db/functions";
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
      orderBy,
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
  where?: TWhere
) =>
  db
    .select({
      marketCap: avg(swaps.marketCap),
      pairAmount: sum(swaps.pairAmount),
      tokenAmount: sum(swaps.tokenAmount),
      virtualPairBalance: avg(swaps.virtualPairBalance),
      virtualTokenBalance: avg(swaps.virtualTokenBalance),
      tradeDirection: swaps.tradeDirection,
    })
    .from(swaps)
    .limit(limit)
    .offset(offset)
    .where(where)
    .groupBy(extract("MINUTES", swaps.timestamp), swaps.tradeDirection);

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
