"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.swaps = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const mints_1 = require("./mints");
const users_1 = require("./users");
exports.swaps = (0, pg_core_1.pgTable)("swaps", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    tokenAmount: (0, pg_core_1.numeric)("token_amount", { precision: 40, scale: 0 }).notNull(),
    pairAmount: (0, pg_core_1.numeric)("pair_amount", {
        precision: 40,
        scale: 0,
    }).notNull(),
    marketCap: (0, pg_core_1.numeric)("market_cap", { precision: 40, scale: 0 }).notNull(),
    virtualTokenBalance: (0, pg_core_1.numeric)("virtual_token_balance", {
        precision: 40,
        scale: 0,
    }).notNull(),
    virtualPairBalance: (0, pg_core_1.numeric)("virtual_pair_balance", {
        precision: 40,
        scale: 0,
    }).notNull(),
    tradeDirection: (0, pg_core_1.integer)("trade_direction").notNull(),
    mint: (0, pg_core_1.text)("mint")
        .references(() => mints_1.mints.id, { onDelete: "cascade" })
        .notNull(),
    payer: (0, pg_core_1.text)("payer")
        .references(() => users_1.users.id, { onDelete: "no action" })
        .notNull(),
    signature: (0, pg_core_1.text)("signature").notNull(),
    timestamp: (0, pg_core_1.timestamp)("timestamp").defaultNow().notNull(),
}, (column) => ({
    signature_trade_direction: (0, pg_core_1.unique)("signature_trade_direction").on(column.signature, column.tradeDirection),
}));
