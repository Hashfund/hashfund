import { and, desc, eq, like, or, SQL, sql } from "drizzle-orm";

import { boundingCurves, mints } from "db/schema";
import { mapFilters, queryBuilder } from "utils/query";

import { getAllMint, getMintLeaderboard } from "./mint.controller";

export const mintQuery = queryBuilder({
  canTrade: mapFilters(mints.canTrade),
  creator: mapFilters(mints.creator),
  // @ts-ignore
  hash: mapFilters(sql`hash`),
});

export const orderMintsBy = (
  value: string | undefined,
  q: ReturnType<typeof getAllMint>
) => {
  switch (value) {
    case "timestamp":
      return q.orderBy(desc(mints.timestamp));
    case "volumeIn":
      return q.orderBy(desc(sql`volume_in`));
    case "price":
      return q.orderBy(desc(boundingCurves.initialPrice));
    case "maxMarketCap":
      return q.orderBy(desc(boundingCurves.maximumMarketCap));
    case "marketCap":
      return q.orderBy(desc(sql`market_cap`));
    default:
      return q;
  }
};

export const orderLeaderboardBy = (
  value: string | undefined,
  q: ReturnType<typeof getMintLeaderboard>
) => {
  switch (value) {
    case "volumeIn":
      return q.orderBy(desc(sql`volume_in`));
    case "volumeOut":
      return q.orderBy(desc(sql`volume_out`));
    default:
      return q;
  }
};

export const withSearch = (
  value: string | undefined,
  ...[filter, limit, offset, where]: Parameters<typeof getAllMint>
) => {
  if (value) {
    let extra = Number.isInteger(value)
      ? [
          sql`market_cap=${value}`,
          sql`maximum_market_cap=${value}`,
          sql`volume_in=${value}`,
          sql`volume_out=${value}`,
        ]
      : [];
    where = and(
      where,
      or(
        like(mints.name, `%${value}%`),
        like(mints.ticker, `%${value}%`),
        eq(mints.id, value),
        ...extra
      )
    );
  }
  return getAllMint(filter, limit, offset, where);
};
