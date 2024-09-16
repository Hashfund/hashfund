import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

import { mints } from "./mint";

export const hashes = pgTable("hashes", {
  id: serial("id").primaryKey(),
  mint: text("mint").references(() => mints.id, { onDelete: "cascade" }),
  marketId: text("market_id"),
  ammId: text("amm_id"),
  timestamp: timestamp("timestamp"),
});
