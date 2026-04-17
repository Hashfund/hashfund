"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildEventListeners = exports.getOrInsertBoundingCurve = void 0;
require("dotenv/config");
const zeroboost_1 = require("@hashfund/zeroboost");
const anchor_1 = require("@coral-xyz/anchor");
const api_1 = require("@hashfund/api");
const error_1 = require("./error");
const utils_1 = require("./utils");
const getOrInsertBoundingCurve = async (program, boundingCurveId) => {
    const boundingCurve = (0, utils_1.safeParse)(Object.assign({ id: boundingCurveId }, await program.account.boundingCurve.fetch(boundingCurveId)));
    return (0, api_1.upsertBoundingCurve)({
        ...boundingCurve,
        initialPrice: String(boundingCurve.initialPrice),
        liquidityPercentage: String(boundingCurve.liquidityPercentage),
    });
};
exports.getOrInsertBoundingCurve = getOrInsertBoundingCurve;
const onMintEvent = (0, error_1.catchAndRetryRuntimeError)(async (program, data, signature) => {
    await (0, api_1.upsertUser)({
        id: data.creator.toBase58(),
    });
    let metadata = null;
    try {
        console.log(`[Watchdog] Fetching metadata for ${data.mint.toBase58()} from ${data.uri}`);
        metadata = await (0, utils_1.safeFetch)(data.uri);
    }
    catch (err) {
        console.warn(`[Watchdog] Failed to fetch metadata for ${data.mint.toBase58()}:`, err);
        metadata = {
            name: data.name,
            symbol: data.symbol,
            description: "Metadata fetch failed. Description pending indexing.",
            image: ""
        };
    }
    // Fetch the actual bonding curve account to get precise initial_supply and liquidity_percentage
    const boundingCurveAccount = await program.account.boundingCurve.fetch(data.boundingCurve);
    // Calculate Total Nominal Supply = (Initial Supply In Curve * 100) / Liquidity %
    // This represents the 100% supply (including the portion reserved for LP)
    const nominalSupply = (new anchor_1.BN(boundingCurveAccount.initialSupply.toString()).mul(new anchor_1.BN(100))).div(new anchor_1.BN(boundingCurveAccount.liquidityPercentage.toString()));
    console.log(`[Watchdog] Processing mint ${data.mint.toBase58()}:`);
    console.log(`  Initial supply in curve: ${boundingCurveAccount.initialSupply.toString()}`);
    console.log(`  Liquidity percentage:   ${boundingCurveAccount.liquidityPercentage.toString()}%`);
    console.log(`  Calculated nominal:      ${nominalSupply.toString()}`);
    await (0, api_1.createMint)({
        id: data.mint.toBase58(),
        uri: data.uri,
        name: data.name,
        symbol: data.symbol,
        creator: data.creator.toBase58(),
        supply: nominalSupply.toString(),
        metadata,
        signature,
        decimals: data.decimals,
    });
    await (0, api_1.upsertBoundingCurve)({
        id: data.boundingCurve.toBase58(),
        ...(0, utils_1.safeParse)(boundingCurveAccount),
        initialPrice: String(boundingCurveAccount.initialPrice),
        liquidityPercentage: String(boundingCurveAccount.liquidityPercentage),
    });
});
const onSwapEvent = (0, error_1.catchAndRetryRuntimeError)(async (program, data, signature) => {
    await (0, api_1.upsertUser)({
        id: data.payer.toBase58(),
    });
    const [boundingCurve] = (0, zeroboost_1.getBoundingCurvePda)(data.mint, program.programId);
    const swap = (0, utils_1.omit)((0, utils_1.safeParse)(data), "timestamp", "tradeDirection");
    await (0, api_1.createSwap)({
        ...swap,
        signature,
        tradeDirection: data.tradeDirection,
    });
    await (0, exports.getOrInsertBoundingCurve)(program, boundingCurve);
});
const onMigrateTriggerEvent = (0, error_1.catchAndRetryRuntimeError)(async (program, data) => {
    const [boundingCurve] = (0, zeroboost_1.getBoundingCurvePda)(data.mint, program.programId);
    await (0, api_1.updateBoundingCurveById)(boundingCurve.toBase58(), {
        tradeable: false,
    });
    await (await (0, zeroboost_1.migrateFund)(program, boundingCurve, program.provider.publicKey, {
        openTime: new anchor_1.BN(0),
    }))
        .preInstructions([
        anchor_1.web3.ComputeBudgetProgram.setComputeUnitLimit({
            units: 300_000,
        }),
    ])
        .rpc();
});
const onMigrateEvent = (0, error_1.catchAndRetryRuntimeError)(async (program, data) => {
    const [boundingCurve] = (0, zeroboost_1.getBoundingCurvePda)(data.mint, program.programId);
    await (0, exports.getOrInsertBoundingCurve)(program, boundingCurve);
});
const buildEventListeners = (program) => {
    const parser = new anchor_1.EventParser(program.programId, new anchor_1.BorshCoder(program.idl));
    const eventListeners = {
        MintEvent: onMintEvent,
        SwapEvent: onSwapEvent,
        MigrateEvent: onMigrateEvent,
        MigrateTriggerEvent: onMigrateTriggerEvent,
    };
    return async (logs) => {
        const events = Array.from(parser.parseLogs(logs.logs));
        console.log(events.map((event) => event.name));
        const errors = [];
        for (const event of events) {
            const method = eventListeners[event.name];
            await method(program, event.data, logs.signature).catch((error) => errors.push(error));
        }
        if (errors.length > 0)
            throw new error_1.MultipleError(...errors);
        return events.map((event) => event.name);
    };
};
exports.buildEventListeners = buildEventListeners;
