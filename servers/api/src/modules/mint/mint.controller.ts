import { z } from "zod";
import moment from "moment";
import {
  and,
  desc,
  eq,
  getTableColumns,
  gt,
  gte,
  like,
  lte,
  or,
  sql,
  SQL,
  sum,
} from "drizzle-orm";

import { buildRange, TimeUnit } from "../../utils/date";

import { hashes } from "../../db/schema/hash";
import { insertMintSchema, updateMintSchema } from "../../db/zod";
import { boundingCurves, mints, swaps, users } from "../../db/schema";
import { caseWhen, coalesce, date, db, hour, toBigInt } from "../../db";

export const createMint = function (values: z.infer<typeof insertMintSchema>) {
  return db.insert(mints).values(values).returning().execute();
};

export const updateMint = function (
  id: string,
  values: z.infer<typeof updateMintSchema>
) {
  return db
    .update(mints)
    .set(values)
    .where(eq(mints.id, id))
    .returning()
    .execute();
};

type Filter = {
  to?: string;
  from?: string;
  unit?: TimeUnit;
};

export const createMintsQuery = (filter?: Filter) => {
  const to = filter?.to ? moment(filter.to).toDate() : new Date();
  const from = filter?.from
    ? moment(filter.from).toDate()
    : moment().subtract(1, "day").toDate();

  const qLastSwap = db
    .selectDistinctOn([swaps.mint],{
      mint: swaps.mint,
      marketCap: swaps.marketCap,
      virtualMarketCap: swaps.virtualMarketCap,
    })
    .from(swaps)
    .orderBy(swaps.mint, desc(swaps.timestamp))
    .as("qLastSwap");

  const qSwaps = db
    .select({
      mint: swaps.mint,
      volumeIn: coalesce(
        sum(
          caseWhen(
            and(or(eq(swaps.tradeDirection, 0))),
            toBigInt(swaps.amountIn)
          )
        ),
        0
      ).as("volume_in"),
      volumeOut: coalesce(
        sum(
          caseWhen(and(eq(swaps.tradeDirection, 1)), toBigInt(swaps.amountOut))
        ),
        0
      ).as("volume_out"),
      volumeInFrom: coalesce(
        sum(
          caseWhen(
            and(
              eq(swaps.tradeDirection, 0),
              gte(swaps.timestamp, from),
              lte(swaps.timestamp, to)
            ),
            toBigInt(swaps.amountIn)
          )
        ),
        0
      ).as("volume_in_from"),
      volumeOutFrom: coalesce(
        sum(
          caseWhen(
            and(
              eq(swaps.tradeDirection, 1),
              gte(swaps.timestamp, from),
              lte(swaps.timestamp, to)
            ),
            toBigInt(swaps.amountOut)
          )
        ),
        0
      ).as("volume_out_from"),
    })
    .from(swaps)
    .groupBy(swaps.mint)
    .as("qSwaps");

  return db
    .select({
      ...getTableColumns(mints),
      volumeIn: qSwaps.volumeIn,
      volumeOut: qSwaps.volumeOut,
      volumeInFrom: qSwaps.volumeInFrom,
      volumeOutFrom: qSwaps.volumeOutFrom,
      virtualMarketCap: toBigInt(qLastSwap.virtualMarketCap).as(
        "virtual_market_cap"
      ),
      marketCap: toBigInt(qLastSwap.marketCap).as("market_cap"),
      boundingCurve: {
        ...getTableColumns(boundingCurves),
        initialPrice: sql<number>`${boundingCurves.initialPrice}`.as(
          "initial_price"
        ),
        initialMarketCap: boundingCurves.initialMarketCap,
        curveInitialSupply: toBigInt(boundingCurves.curveInitialSupply).as(
          "curve_initial_marketcap"
        ),
        maximumMarketCap: toBigInt(boundingCurves.maximumMarketCap).as(
          "maximum_market_cap"
        ),
      },
      hash: {
        id: hashes.id,
        ammId: hashes.ammId,
        marketId: hashes.marketId,
      },
    })
    .from(mints)
    .innerJoin(boundingCurves, eq(boundingCurves.mint, mints.id))
    .innerJoin(qSwaps, eq(qSwaps.mint, mints.id))
    .innerJoin(qLastSwap, eq(qLastSwap.mint, mints.id))
    .leftJoin(hashes, eq(hashes.mint, mints.id));
};

export const getAllMint = (
  filter: Filter,
  limit: number,
  offset: number,
  where?: SQL
) => {
  return createMintsQuery(filter).where(where).limit(limit).offset(offset);
};

export const getMint = (id: string, filter: Filter) =>
  createMintsQuery(filter).where(eq(mints.id, id)).limit(1).execute();

export const getMintLeaderboard = (id: string) => {
  return db
    .select({
      user: users,
      volumeIn: coalesce(
        sum(caseWhen(eq(swaps.tradeDirection, 0), toBigInt(swaps.amountIn))),
        0
      ).as("volume_in"),
      volumeOut: coalesce(
        sum(caseWhen(eq(swaps.tradeDirection, 1), toBigInt(swaps.amountOut))),
        0
      ).as("volume_out"),
    })
    .from(swaps)
    .rightJoin(users, eq(users.id, swaps.payer))
    .where(eq(swaps.mint, id))
    .groupBy(swaps.payer, users.id);
};

export const getMintGraph = (id: string, filter: NonNullable<Filter>) => {
  const to = moment(filter.to);
  const from = moment(filter.from);

  const range = buildRange(from, to, filter.unit!).map(
    ([from, to]) =>
      [from, and(lte(swaps.timestamp, from), gt(swaps.timestamp, to))] as const
  );

  const dateColumn =
    filter.unit === "time" ? hour(swaps.timestamp) : date(swaps.timestamp);

  return Promise.all(
    range.map(async ([date, where]) => ({
      date: date.toISOString(),
      ...((
        await db
          .select({
            volumeIn: coalesce(
              sum(
                caseWhen(
                  or(eq(swaps.tradeDirection, 0), eq(swaps.tradeDirection, 2)),
                  toBigInt(swaps.amountIn)
                )
              ),
              0
            ),
            volumeOut: coalesce(
              sum(
                caseWhen(eq(swaps.tradeDirection, 1), toBigInt(swaps.amountOut))
              ),
              0
            ),
          })
          .from(swaps)
          .where(and(eq(swaps.mint, id), where))
          .orderBy(dateColumn)
          .groupBy(dateColumn)
          .execute()
      ).at(0) ?? {
        date: date.toISOString(),
        volumeIn: "0",
        volumeOut: "0",
      }),
    }))
  );
};

export const searchMint = (search: string) => {
  return createMintsQuery().where(
    or(
      like(mints.name, `%${search}%`),
      like(mints.ticker, `%${search}%`),
      eq(mints.id, search),
      sql`market_cap=${search}`,
      sql`maximum_market_cap=${search}`,
      sql`volume_in=${search}`,
      sql`volume_out=${search}`
    )
  );
};
