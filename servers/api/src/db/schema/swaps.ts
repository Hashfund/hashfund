import {
  bigint,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { mints } from "./mints";
import { users } from "./users";

export const swaps = pgTable("swaps", {
  id: uuid("id").defaultRandom().primaryKey(),
  tokenAmount: bigint("token_amount", { mode: "bigint" }).notNull(),
  pairAmount: bigint("pair_amount", {
    mode: "bigint",
  }).notNull(),
  marketCap: bigint("market_cap", { mode: "bigint" }).notNull(),
  virtualTokenBalance: bigint("virtual_token_balance", {
    mode: "bigint",
  }).notNull(),
  virtualPairBalance: bigint("virtual_pair_balance", {
    mode: "bigint",
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
});
