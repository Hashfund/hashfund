import { pgTable, text, bigint, unique } from "drizzle-orm/pg-core";
import { users } from "./users";
import { mints } from "./mints";

export const userPositions = pgTable(
  "user_positions",
  {
    id: text("id").primaryKey(),
    user: text("user")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    mint: text("mint")
      .references(() => mints.id, { onDelete: "cascade" })
      .notNull(),
    contributed: bigint("contributed", { mode: "bigint" }).notNull(),
    refunded: bigint("refunded", { mode: "bigint" }).notNull(),
    refundableRemaining: bigint("refundable_remaining", { mode: "bigint" }).notNull(),
    allocatedTokens: bigint("allocated_tokens", { mode: "bigint" }).notNull(),
    burnedTokens: bigint("burned_tokens", { mode: "bigint" }).notNull(),
  },
  (t) => ({
    unq: unique().on(t.user, t.mint),
  })
);
