"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUserById = exports.updateUserById = exports.getUserById = exports.getUsers = exports.upsertUser = exports.createUser = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const db_1 = require("../../db");
const schema_1 = require("../../db/schema");
const functions_1 = require("../../db/functions");
const createUser = (values) => db_1.db.insert(schema_1.users).values(values).returning().execute();
exports.createUser = createUser;
const upsertUser = (values) => db_1.db
    .insert(schema_1.users)
    .values(values)
    .onConflictDoNothing({ target: schema_1.users.id })
    .returning()
    .execute();
exports.upsertUser = upsertUser;
const getUsers = (limit, offset, where, orderBy, mintId, tradeDirection) => {
    const swapFilters = [];
    if (mintId !== undefined)
        swapFilters.push((0, drizzle_orm_1.eq)(schema_1.swaps.mint, mintId));
    if (tradeDirection !== undefined)
        swapFilters.push((0, drizzle_orm_1.eq)(schema_1.swaps.tradeDirection, tradeDirection));
    const qSwaps = db_1.db.$with("swaps").as(db_1.db
        .select({
        payer: schema_1.swaps.payer,
        pairAmount: (0, drizzle_orm_1.sum)(schema_1.swaps.pairAmount).as("pair_amount"),
    })
        .from(schema_1.swaps)
        .where(swapFilters.length > 0 ? (0, drizzle_orm_1.and)(...swapFilters) : undefined)
        .groupBy(schema_1.swaps.payer));
    const q = db_1.db
        .select({
        ...(0, drizzle_orm_1.getTableColumns)(schema_1.users),
        pairAmount: (0, functions_1.coalesce)((0, drizzle_orm_1.sum)(qSwaps.pairAmount), 0).as("pair_amount"),
    })
        .from(schema_1.users)
        .innerJoin(qSwaps, (0, drizzle_orm_1.eq)(qSwaps.payer, schema_1.users.id))
        .limit(limit)
        .offset(offset)
        .groupBy(schema_1.users.id)
        .where(where);
    if (orderBy)
        return q.orderBy(orderBy).execute();
    else
        return q.execute();
};
exports.getUsers = getUsers;
const getUserById = (id) => db_1.db.query.users
    .findFirst({
    where: (0, drizzle_orm_1.eq)(schema_1.users.id, id),
})
    .execute();
exports.getUserById = getUserById;
const updateUserById = (id, values) => db_1.db.update(schema_1.users).set(values).where((0, drizzle_orm_1.eq)(schema_1.users.id, id)).returning().execute();
exports.updateUserById = updateUserById;
const deleteUserById = (id) => db_1.db.delete(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.id, id)).returning().execute();
exports.deleteUserById = deleteUserById;
