import {
  pgTable,
  text,
  timestamp,
  json,
  integer,
  numeric,
} from "drizzle-orm/pg-core";

import { users } from "./users";
import { JsonMetadata } from "../../types";

export const mints = pgTable("mints", {
  id: text("id").primaryKey(),
  uri: text("uri").notNull(),
  name: text("name").notNull(),
  symbol: text("symbol").notNull(),
  supply: numeric("supply", { precision: 40, scale: 0 }).notNull(),
  decimals: integer("decimals").notNull(),
  metadata: json("metadata").$type<JsonMetadata>(),
  creator: text("creator")
    .references(() => users.id, { onDelete: "no action" })
    .notNull(),
  signature: text("signature").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});
