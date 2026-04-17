import {
  boolean,
  decimal,
  integer,
  numeric,
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
  initialSupply: numeric("initial_supply", { precision: 40, scale: 0 }).notNull(),
  liquidityPercentage: decimal("liquidity_percentage").notNull(),
  minimumPairBalance: numeric("minimum_pair_balance", {
    precision: 40,
    scale: 0,
  }).notNull(),
  maximumPairBalance: numeric("maximum_pair_balance", {
    precision: 40,
    scale: 0,
  }).notNull(),
  virtualTokenBalance: numeric("virtual_token_balance", {
    precision: 40,
    scale: 0,
  }).notNull(),
  virtualPairBalance: numeric("virtual_pair_balance", {
    precision: 40,
    scale: 0,
  }).notNull(),
  netActiveCapital: numeric("net_active_capital", {
    precision: 40,
    scale: 0,
  }).notNull(),
  totalContributed: numeric("total_contributed", {
    precision: 40,
    scale: 0,
  }).notNull(),
  totalBurnedTokens: numeric("total_burned_tokens", {
    precision: 40,
    scale: 0,
  }).notNull(),
  totalFeesCollected: numeric("total_fees_collected", {
    precision: 40,
    scale: 0,
  }).notNull(),
  bump: integer("bump").notNull(),
  reserveBump: integer("reserve_bump").notNull(),
  mint: text("mint")
    .references(() => mints.id, { onDelete: "cascade" })
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updateAt: timestamp("updated_at").defaultNow().notNull(),
});
