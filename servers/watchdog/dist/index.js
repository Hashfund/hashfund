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
    return (0, api_1.upsertBoundingCurve)(boundingCurve);
};
exports.getOrInsertBoundingCurve = getOrInsertBoundingCurve;
const onMintEvent = (0, error_1.catchAndRetryRuntimeError)(async (program, data, signature) => {
    await (0, api_1.upsertUser)({
        id: data.creator.toBase58(),
    });
    const mint = (0, utils_1.omit)((0, utils_1.safeParse)({ id: data.mint, ...data }), "decimals", "timestamp", "mint", "boundingCurve");
    const metadata = await (0, utils_1.safeFetch)(mint.uri);
    await (0, api_1.createMint)({
        ...mint,
        metadata,
        signature,
        decimals: data.decimals,
    });
    await (0, exports.getOrInsertBoundingCurve)(program, data.boundingCurve);
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
