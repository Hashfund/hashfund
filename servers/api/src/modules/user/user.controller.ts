import type { z } from "zod";
import { eq, getTableColumns, SQL, sum } from "drizzle-orm";
import { TradeDirection } from "@hashfund/zeroboost";

import { db } from "../../db";
import { swaps, users } from "../../db/schema";
import { coalesce } from "../../db/functions";
import { and, eq, getTableColumns, SQL, sum } from "drizzle-orm";
import type { insertUserSchema } from "../../db/zod";

export const createUser = (values: z.infer<typeof insertUserSchema>) =>
  db.insert(users).values(values).returning().execute();

export const upsertUser = (
  values: z.infer<typeof insertUserSchema>,
) =>
  db
    .insert(users)
    .values(values)
    .onConflictDoNothing({ target: users.id })
    .returning()
    .execute();

export const getUsers = <TWhere extends SQL, TOrderBy extends SQL>(
  limit: number,
  offset: number,
  where?: TWhere,
  orderBy?: TOrderBy,
  mintId?: string,
  tradeDirection?: number
) => {
  const swapFilters = [];
  if (mintId !== undefined) swapFilters.push(eq(swaps.mint, mintId));
  if (tradeDirection !== undefined) swapFilters.push(eq(swaps.tradeDirection, tradeDirection));

  const qSwaps = db.$with("swaps").as(
    db
      .select({
        payer: swaps.payer,
        pairAmount: sum(swaps.pairAmount).as("pair_amount"),
      })
      .from(swaps)
      .where(swapFilters.length > 0 ? and(...swapFilters) : undefined)
      .groupBy(swaps.payer)
  );

  const q = db
    .select({
      ...getTableColumns(users),
      pairAmount: coalesce(sum(qSwaps.pairAmount), 0).as("pair_amount"),
    })
    .from(users)
    .innerJoin(qSwaps, eq(qSwaps.payer, users.id))
    .limit(limit)
    .offset(offset)
    .groupBy(users.id)
    .where(where);

  if (orderBy) return q.orderBy(orderBy).execute();
  else return q.execute();
};

export const getUserById = (id: string) =>
  db.query.users
    .findFirst({
      where: eq(users.id, id),
    })
    .execute();

export const updateUserById = (
  id: string,
  values: Partial<z.infer<typeof insertUserSchema>>
) => db.update(users).set(values).where(eq(users.id, id)).returning().execute();

export const deleteUserById = (id: string) =>
  db.delete(users).where(eq(users.id, id)).returning().execute();
