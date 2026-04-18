"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.swapsRelations = exports.mintsRelations = exports.usersRelations = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const mints_1 = require("./mints");
const users_1 = require("./users");
const swaps_1 = require("./swaps");
const boundingCurves_1 = require("./boundingCurves");
exports.usersRelations = (0, drizzle_orm_1.relations)(users_1.users, ({ many }) => ({
    mints: many(mints_1.mints),
    swaps: many(swaps_1.swaps),
}));
exports.mintsRelations = (0, drizzle_orm_1.relations)(mints_1.mints, ({ one, many }) => ({
    creator: one(users_1.users, {
        fields: [mints_1.mints.creator],
        references: [users_1.users.id],
    }),
    boundingCurve: one(boundingCurves_1.boundingCurves, {
        fields: [mints_1.mints.id],
        references: [boundingCurves_1.boundingCurves.mint],
    }),
    swaps: many(swaps_1.swaps),
}));
exports.swapsRelations = (0, drizzle_orm_1.relations)(swaps_1.swaps, ({ one }) => ({
    payer: one(users_1.users, {
        fields: [swaps_1.swaps.payer],
        references: [users_1.users.id],
    }),
    mint: one(mints_1.mints, {
        fields: [swaps_1.swaps.mint],
        references: [mints_1.mints.id],
    }),
}));
