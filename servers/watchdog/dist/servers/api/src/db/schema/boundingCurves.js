"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.boundingCurves = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const mints_1 = require("./mints");
exports.boundingCurves = (0, pg_core_1.pgTable)("boundingCurve", {
    id: (0, pg_core_1.text)("id").primaryKey(),
    migrated: (0, pg_core_1.boolean)("migrated").notNull(),
    tradeable: (0, pg_core_1.boolean)("tradeable").notNull(),
    initialPrice: (0, pg_core_1.decimal)("initial_price").notNull(),
    initialSupply: (0, pg_core_1.numeric)("initial_supply", { precision: 40, scale: 0 }).notNull(),
    liquidityPercentage: (0, pg_core_1.decimal)("liquidity_percentage").notNull(),
    minimumPairBalance: (0, pg_core_1.numeric)("minimum_pair_balance", {
        precision: 40,
        scale: 0,
    }).notNull(),
    maximumPairBalance: (0, pg_core_1.numeric)("maximum_pair_balance", {
        precision: 40,
        scale: 0,
    }).notNull(),
    virtualTokenBalance: (0, pg_core_1.numeric)("virtual_token_balance", {
        precision: 40,
        scale: 0,
    }).notNull(),
    virtualPairBalance: (0, pg_core_1.numeric)("virtual_pair_balance", {
        precision: 40,
        scale: 0,
    }).notNull(),
    netActiveCapital: (0, pg_core_1.numeric)("net_active_capital", {
        precision: 40,
        scale: 0,
    }).notNull(),
    totalContributed: (0, pg_core_1.numeric)("total_contributed", {
        precision: 40,
        scale: 0,
    }).notNull(),
    totalBurnedTokens: (0, pg_core_1.numeric)("total_burned_tokens", {
        precision: 40,
        scale: 0,
    }).notNull(),
    totalFeesCollected: (0, pg_core_1.numeric)("total_fees_collected", {
        precision: 40,
        scale: 0,
    }).notNull(),
    bump: (0, pg_core_1.integer)("bump").notNull(),
    reserveBump: (0, pg_core_1.integer)("reserve_bump").notNull(),
    mint: (0, pg_core_1.text)("mint")
        .references(() => mints_1.mints.id, { onDelete: "cascade" })
        .notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
    updateAt: (0, pg_core_1.timestamp)("updated_at").defaultNow().notNull(),
});
