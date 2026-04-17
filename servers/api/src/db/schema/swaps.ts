import {
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

import { mints } from "./mints";
import { users } from "./users";

export const swaps = pgTable(
  "swaps",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tokenAmount: numeric("token_amount", { precision: 40, scale: 0 }).notNull(),
    pairAmount: numeric("pair_amount", {
      precision: 40,
      scale: 0,
    }).notNull(),
    marketCap: numeric("market_cap", { precision: 40, scale: 0 }).notNull(),
    virtualTokenBalance: numeric("virtual_token_balance", {
      precision: 40,
      scale: 0,
    }).notNull(),
    virtualPairBalance: numeric("virtual_pair_balance", {
      precision: 40,
      scale: 0,
    }).notNull(),
    tradeDirection: integer("trade_direction").notNull(),
    mint: text("mint")
      .references(() => mints.id, { onDelete: "cascade" })
      .notNull(),
    payer: text("payer")
      .references(() => users.id, { onDelete: "no action" })
      .notNull(),
    signature: text("signature").notNull(),
    timestamp: timestamp("timestamp").defaultNow().notNull(),
  },
  (column) => ({
    signature_trade_direction: unique("signature_trade_direction").on(
      column.signature,
      column.tradeDirection
    ),
  })
);
