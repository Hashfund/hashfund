"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mints = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const users_1 = require("./users");
exports.mints = (0, pg_core_1.pgTable)("mints", {
    id: (0, pg_core_1.text)("id").primaryKey(),
    uri: (0, pg_core_1.text)("uri").notNull(),
    name: (0, pg_core_1.text)("name").notNull(),
    symbol: (0, pg_core_1.text)("symbol").notNull(),
    supply: (0, pg_core_1.numeric)("supply", { precision: 40, scale: 0 }).notNull(),
    decimals: (0, pg_core_1.integer)("decimals").notNull(),
    metadata: (0, pg_core_1.json)("metadata").$type(),
    creator: (0, pg_core_1.text)("creator")
        .references(() => users_1.users.id, { onDelete: "no action" })
        .notNull(),
    signature: (0, pg_core_1.text)("signature").notNull(),
    timestamp: (0, pg_core_1.timestamp)("timestamp").defaultNow().notNull(),
});
