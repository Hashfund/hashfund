"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSwapsVolume = exports.getSwapsGraph = exports.getSwapById = exports.getSwaps = exports.createSwap = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const db_1 = require("../../db");
const schema_1 = require("../../db/schema");
const functions_1 = require("../../db/functions");
const createSwap = (values) => db_1.db.insert(schema_1.swaps).values(values).returning().execute();
exports.createSwap = createSwap;
const getSwaps = (limit, offset, where, orderBy) => db_1.db.query.swaps
    .findMany({
    limit,
    offset,
    where,
    with: {
        payer: true,
    },
    columns: {
        id: true,
        pairAmount: true,
        tokenAmount: true,
        marketCap: true,
        mint: true,
        timestamp: true,
        signature: true,
        tradeDirection: true,
    },
})
    .execute();
exports.getSwaps = getSwaps;
const getSwapById = (id) => db_1.db.query.swaps
    .findFirst({
    where: (0, drizzle_orm_1.eq)(schema_1.swaps.id, id),
    with: {
        mint: true,
        payer: true,
    },
    columns: {
        id: true,
        marketCap: true,
        signature: true,
        timestamp: true,
        pairAmount: true,
        tokenAmount: true,
        tradeDirection: true,
        virtualPairBalance: true,
        virtualTokenBalance: true,
    },
})
    .execute();
exports.getSwapById = getSwapById;
const getSwapsGraph = (limit, offset, resolution, duration, where) => db_1.db
    .select({
    open: (0, functions_1.first)(schema_1.swaps.virtualPairBalance),
    close: (0, functions_1.last)(schema_1.swaps.virtualPairBalance),
    high: (0, drizzle_orm_1.max)(schema_1.swaps.virtualPairBalance),
    low: (0, drizzle_orm_1.min)(schema_1.swaps.virtualPairBalance),
    time: (0, functions_1.interval)(resolution, duration, schema_1.swaps.timestamp).as("time"),
})
    .from(schema_1.swaps)
    .limit(limit)
    .offset(offset)
    .where(where ? (0, drizzle_orm_1.and)(where, (0, drizzle_orm_1.eq)(schema_1.swaps.tradeDirection, 1)) : (0, drizzle_orm_1.eq)(schema_1.swaps.tradeDirection, 1))
    .orderBy((0, drizzle_orm_1.sql) `time`)
    .groupBy((0, drizzle_orm_1.sql) `time`);
exports.getSwapsGraph = getSwapsGraph;
const getSwapsVolume = (where) => db_1.db
    .select({
    pairVolume: (0, drizzle_orm_1.sum)(schema_1.swaps.pairAmount),
    tokenVolume: (0, drizzle_orm_1.sum)(schema_1.swaps.tokenAmount),
    tradeDirection: schema_1.swaps.tradeDirection,
})
    .from(schema_1.swaps)
    .where(where)
    .groupBy(schema_1.swaps.mint, schema_1.swaps.tradeDirection)
    .execute();
exports.getSwapsVolume = getSwapsVolume;
