import { BN } from "bn.js";
import moment from "moment";
import type { z } from "zod";
import { and, desc, eq, not, or, SQL, sum } from "drizzle-orm";

import { buildRange } from "../../utils/date";
import { boundingCurves, swaps } from "../../db/schema";
import { caseWhen, coalesce, db, toBigInt } from "../../db";
import type { insertBoundingCurveSchema, insertSwapSchema } from "../../db/zod";

export const createBoundingCurve = function (
  value: z.infer<typeof insertBoundingCurveSchema>
) {
  return db.insert(boundingCurves).values(value).returning();
};

export const createSwap = function (value: z.infer<typeof insertSwapSchema>) {
  return db.insert(swaps).values(value).returning();
};

export const getAllSwaps = function (
  limit: number,
  offset: number,
  where?: SQL
) {
  return db.query.swaps.findMany({
    where: and(where, not(eq(swaps.tradeDirection, 2))),
    limit,
    offset,
    with: {
      payer: true,
    },
    extras: {
      amountIn: toBigInt(swaps.amountIn).as("amount_in"),
      amountOut: toBigInt(swaps.amountOut).as("amount_out"),
      marketCap: toBigInt(swaps.marketCap).as("market_cap"),
    },
    orderBy: desc(swaps.timestamp),
  });
};

/// todo chunk
export const getAllSwapByMint = async function (
  mint: string,
  limit: number,
  offset: number,
  from?: string,
  to?: string
) {
  let toDate = moment(to);
  let fromDate = from ? moment(from) : moment(from).subtract(1, "day");

  const qSwaps = await db
    .select()
    .from(swaps)
    .where(and(eq(swaps.mint, mint)))
    .orderBy(desc(swaps.timestamp))
    .limit(limit)
    .offset(offset)
    .execute();

  const lastSwap = qSwaps.at(qSwaps.length - 1);

  if (qSwaps.length === 0 || toDate.diff(lastSwap?.timestamp) < 0) {
    return [];
  }

  const range = buildRange(fromDate, toDate, "time");

  return range
    .map(([to, from]) => {
      const swaps = qSwaps.filter((swap) => {
        const timestamp = moment(swap.timestamp);
        return timestamp.isSameOrAfter(from) && timestamp.isSameOrBefore(to);
      });

      const buys = swaps.filter(({ tradeDirection }) => tradeDirection !== 1);
      const sells = swaps.filter(({ tradeDirection }) => tradeDirection === 1);

      const amountIn = buys.reduceRight(
        (a, b) => new BN(a).add(new BN(b.amountIn, "hex")),
        new BN(0)
      );
      const amountOut = sells.reduce(
        (a, b) => new BN(a).add(new BN(b.amountOut, "hex")),
        new BN(0)
      );

      /// account if no swap in date
      const closestSwap = qSwaps.reduce((prev, curr) => {
        const prevDiff = Math.abs(from.getTime() - prev.timestamp.getTime());
        const currDiff = Math.abs(from.getTime() - curr.timestamp.getTime());
        return currDiff < prevDiff ? curr : prev;
      }, qSwaps[0]);

      const swap = swaps.length > 0 ? swaps[0] : closestSwap;

      return swap
        ? {
            buy: amountIn.toString(),
            sold: amountOut.toString(),
            time: from,
            marketCap: new BN(swap!.marketCap, "hex").toString(),
          }
        : null;
    })
    .filter((swap) => swap !== null);
};

export const getUserSwapByMint = function (mint: string, userId: string) {
  return db
    .select({
      bought: coalesce(
        sum(
          caseWhen(
            or(eq(swaps.tradeDirection, 0), eq(swaps.tradeDirection, 2)),
            toBigInt(swaps.amountIn)
          )
        ),
        0
      ),
      sold: coalesce(
        sum(caseWhen(eq(swaps.tradeDirection, 1), toBigInt(swaps.amountOut))),
        0
      ),
    })
    .from(swaps)
    .where(and(eq(swaps.mint, mint), eq(swaps.payer, userId)))
    .groupBy(swaps.payer, swaps.tradeDirection);
};
