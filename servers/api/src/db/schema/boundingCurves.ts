import {
  bigint,
  boolean,
  decimal,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

import { mints } from "./mints";

export const boundingCurves = pgTable("boundingCurve", {
  id: text("id").primaryKey(),
  migrated: boolean("migrated").notNull(),
  tradeable: boolean("tradeable").notNull(),
  initialPrice: decimal("initial_price").notNull(),
  liquidityPercentage: decimal("liquidity_percentage").notNull(),
  minimumPairBalance: bigint("minimum_pair_balance", {
    mode: "bigint",
  }).notNull(),
  maximumPairBalance: bigint("maximum_pair_balance", {
    mode: "bigint",
  }).notNull(),
  virtualTokenBalance: bigint("virtual_token_balance", {
    mode: "bigint",
  }).notNull(),
  virtualPairBalance: bigint("virtual_pair_balance", {
    mode: "bigint",
  }).notNull(),
  mint: text("mint")
    .references(() => mints.id, { onDelete: "cascade" })
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updateAt: timestamp("updated_at").defaultNow().notNull(),
});
