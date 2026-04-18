"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMintsByUser = exports.getMintById = exports.getMints = exports.updateMint = exports.createMint = void 0;
const zeroboost_1 = require("@hashfund/zeroboost");
const drizzle_orm_1 = require("drizzle-orm");
const db_1 = require("../../db");
const schema_1 = require("../../db/schema");
const functions_1 = require("../../db/functions");
const createMint = (values) => db_1.db.insert(schema_1.mints).values(values).returning().execute();
exports.createMint = createMint;
const updateMint = (values) => db_1.db.update(schema_1.mints).set(values).returning().execute();
exports.updateMint = updateMint;
/**
 * FAIL-SAFE: Automatically corrects 10,000x scaling errors for token quantities.
 * This is a safety valve for the 10.8T supply bug.
 */
function fixValue(val) {
    if (!val)
        return val;
    const s = String(val);
    // If the value is > 10^18 (Quintillion), it's likely a 10,000x inflated 1 Billion supply (which is 10^15 normally)
    if (s.length >= 19) {
        try {
            const bigint = BigInt(s);
            return (bigint / BigInt(10000)).toString();
        }
        catch {
            return s;
        }
    }
    return s;
}
function fixMint(mint) {
    if (!mint)
        return mint;
    if (mint.supply)
        mint.supply = fixValue(mint.supply);
    if (mint.boundingCurve) {
        if (mint.boundingCurve.initialSupply)
            mint.boundingCurve.initialSupply = fixValue(mint.boundingCurve.initialSupply);
        if (mint.boundingCurve.virtualTokenBalance)
            mint.boundingCurve.virtualTokenBalance = fixValue(mint.boundingCurve.virtualTokenBalance);
    }
    return mint;
}
const getMints = async (limit, offset, where, orderBy) => {
    const qSwap = db_1.db.$with("qSwap").as(db_1.db
        .select({
        mint: schema_1.swaps.mint,
        pairVolume: (0, drizzle_orm_1.sum)(schema_1.swaps.pairAmount).as("pair_amount"),
        tokenVolume: (0, drizzle_orm_1.sum)(schema_1.swaps.tokenAmount).as("token_amount"),
        buyVolume: (0, functions_1.caseWhen)((0, drizzle_orm_1.eq)(schema_1.swaps.tradeDirection, zeroboost_1.TradeDirection.BtoA), (0, drizzle_orm_1.sum)(schema_1.swaps.pairAmount)).as("buy_volume"),
        sellVolume: (0, functions_1.caseWhen)((0, drizzle_orm_1.eq)(schema_1.swaps.tradeDirection, zeroboost_1.TradeDirection.AtoB), (0, drizzle_orm_1.sum)(schema_1.swaps.pairAmount)).as("sell_volume"),
        count: (0, drizzle_orm_1.count)(schema_1.swaps.id).as("count"),
    })
        .from(schema_1.swaps)
        .groupBy(schema_1.swaps.mint, schema_1.swaps.tradeDirection));
    const query = db_1.db
        .with(qSwap)
        .select({
        ...(0, drizzle_orm_1.getTableColumns)(schema_1.mints),
        boundingCurve: (0, drizzle_orm_1.getTableColumns)(schema_1.boundingCurves),
        market: {
            txnCount: (0, drizzle_orm_1.sum)(qSwap.count).mapWith(Number),
            buyVolume: (0, functions_1.coalesce)((0, drizzle_orm_1.sum)(qSwap.buyVolume), 0).mapWith(BigInt),
            sellVolume: (0, functions_1.coalesce)((0, drizzle_orm_1.sum)(qSwap.sellVolume), 0).mapWith(BigInt),
            pairVolume: (0, functions_1.coalesce)((0, drizzle_orm_1.sum)(qSwap.pairVolume), 0).mapWith(BigInt),
            tokenVolume: (0, functions_1.coalesce)((0, drizzle_orm_1.sum)(qSwap.tokenVolume), 0).mapWith(BigInt),
        },
    })
        .from(schema_1.mints)
        .limit(limit)
        .offset(offset)
        .where(where)
        .leftJoin(qSwap, (0, drizzle_orm_1.eq)(qSwap.mint, schema_1.mints.id))
        .innerJoin(schema_1.boundingCurves, (0, drizzle_orm_1.eq)(schema_1.boundingCurves.mint, schema_1.mints.id))
        .groupBy(schema_1.mints.id, qSwap.mint, schema_1.boundingCurves.id);
    const results = await (orderBy ? query.orderBy(orderBy).execute() : query.execute());
    return results.map(fixMint);
};
exports.getMints = getMints;
const getMintById = async (id) => {
    const qSwap = db_1.db.$with("qSwap").as(db_1.db
        .select({
        mint: schema_1.swaps.mint,
        pairVolume: (0, drizzle_orm_1.sum)(schema_1.swaps.pairAmount).as("pair_amount"),
        tokenVolume: (0, drizzle_orm_1.sum)(schema_1.swaps.tokenAmount).as("token_amount"),
        buyVolume: (0, functions_1.caseWhen)((0, drizzle_orm_1.eq)(schema_1.swaps.tradeDirection, zeroboost_1.TradeDirection.BtoA), (0, drizzle_orm_1.sum)(schema_1.swaps.pairAmount)).as("buy_volume"),
        sellVolume: (0, functions_1.caseWhen)((0, drizzle_orm_1.eq)(schema_1.swaps.tradeDirection, zeroboost_1.TradeDirection.AtoB), (0, drizzle_orm_1.sum)(schema_1.swaps.pairAmount)).as("sell_volume"),
        count: (0, drizzle_orm_1.count)(schema_1.swaps.id).as("count"),
    })
        .from(schema_1.swaps)
        .where((0, drizzle_orm_1.eq)(schema_1.swaps.mint, id))
        .groupBy(schema_1.swaps.mint, schema_1.swaps.tradeDirection));
    const results = await db_1.db
        .with(qSwap)
        .select({
        ...(0, drizzle_orm_1.getTableColumns)(schema_1.mints),
        boundingCurve: (0, drizzle_orm_1.getTableColumns)(schema_1.boundingCurves),
        market: {
            txnCount: (0, drizzle_orm_1.sum)(qSwap.count).mapWith(Number),
            buyVolume: (0, functions_1.coalesce)((0, drizzle_orm_1.sum)(qSwap.buyVolume), 0).mapWith(BigInt),
            sellVolume: (0, functions_1.coalesce)((0, drizzle_orm_1.sum)(qSwap.sellVolume), 0).mapWith(BigInt),
            pairVolume: (0, functions_1.coalesce)((0, drizzle_orm_1.sum)(qSwap.pairVolume), 0).mapWith(BigInt),
            tokenVolume: (0, functions_1.coalesce)((0, drizzle_orm_1.sum)(qSwap.tokenVolume), 0).mapWith(BigInt),
        },
    })
        .from(schema_1.mints)
        .where((0, drizzle_orm_1.eq)(schema_1.mints.id, id))
        .leftJoin(qSwap, (0, drizzle_orm_1.eq)(qSwap.mint, schema_1.mints.id))
        .innerJoin(schema_1.boundingCurves, (0, drizzle_orm_1.eq)(schema_1.boundingCurves.mint, schema_1.mints.id))
        .groupBy(schema_1.mints.id, qSwap.mint, schema_1.boundingCurves.id)
        .execute();
    return fixMint(results[0]);
};
exports.getMintById = getMintById;
const getMintsByUser = (user, limit, offset) => {
    const qSwaps = db_1.db
        .$with("qSwaps")
        .as(db_1.db.selectDistinctOn([schema_1.swaps.payer]).from(schema_1.swaps));
    return db_1.db
        .with(qSwaps)
        .selectDistinctOn([schema_1.mints.id], (0, drizzle_orm_1.getTableColumns)(schema_1.mints))
        .from(schema_1.mints)
        .limit(limit)
        .offset(offset)
        .innerJoin(qSwaps, (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(qSwaps.mint, schema_1.mints.id), (0, drizzle_orm_1.eq)(qSwaps.payer, user)))
        .execute();
};
exports.getMintsByUser = getMintsByUser;
