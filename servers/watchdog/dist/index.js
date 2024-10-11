"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildEventListeners = exports.getOrInsertBoundingCurve = void 0;
require("dotenv/config");
const zeroboost_1 = require("@hashfund/zeroboost");
const anchor_1 = require("@coral-xyz/anchor");
const api_1 = require("@hashfund/api");
const error_1 = require("./error");
const utils_1 = require("./utils");
const config_1 = require("./config");
const provider = new anchor_1.AnchorProvider(new anchor_1.web3.Connection(config_1.ANCHOR_PROVIDER_URL), new anchor_1.Wallet(config_1.ANCHOR_WALLET), {
    commitment: "confirmed",
});
const program = new anchor_1.Program(zeroboost_1.IDL, zeroboost_1.devnet.ZERO_BOOST_PROGRAM, provider);
const getOrInsertBoundingCurve = async (program, boundingCurveId, database) => {
    const boundingCurve = (0, utils_1.safeParse)(Object.assign({ id: boundingCurveId }, await program.account.boundingCurve.fetch(boundingCurveId)));
    return (0, api_1.upsertBoundingCurve)(boundingCurve, database);
};
exports.getOrInsertBoundingCurve = getOrInsertBoundingCurve;
const onMintEvent = (0, error_1.catchAndRetryRuntimeError)(async (data, _slot, signature, database) => {
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
    }, database);
    await (0, exports.getOrInsertBoundingCurve)(program, data.boundingCurve, database);
});
const onSwapEvent = (0, error_1.catchAndRetryRuntimeError)(async (data, _slot, signature, database) => {
    await (0, api_1.upsertUser)({
        id: data.payer.toBase58(),
    });
    const [boundingCurve] = (0, zeroboost_1.getBoundingCurvePda)(data.mint, program.programId);
    const swap = (0, utils_1.omit)((0, utils_1.safeParse)(data), "timestamp", "tradeDirection");
    await (0, api_1.createSwap)({
        ...swap,
        signature,
        tradeDirection: data.tradeDirection,
    }, database);
    await (0, exports.getOrInsertBoundingCurve)(program, boundingCurve, database);
});
const onMigrateTriggerEvent = (0, error_1.catchAndRetryRuntimeError)(async (data, _, __, database) => {
    const [boundingCurve] = (0, zeroboost_1.getBoundingCurvePda)(data.mint, program.programId);
    await (0, api_1.updateBoundingCurveById)(boundingCurve.toBase58(), {
        tradeable: false,
    }, database);
    await program.methods
        .migrateFund({
        openTime: null,
    })
        .accounts({})
        .rpc();
});
const onMigrateEvent = (0, error_1.catchAndRetryRuntimeError)(async (data, _, __, database) => {
    const [boundingCurve] = (0, zeroboost_1.getBoundingCurvePda)(data.mint, program.programId);
    await (0, exports.getOrInsertBoundingCurve)(program, boundingCurve, database);
});
const buildEventListeners = (parser) => {
    const eventListeners = {
        MintEvent: onMintEvent,
        SwapEvent: onSwapEvent,
        MigrateEvent: onMigrateEvent,
        MigrateTriggerEvent: onMigrateTriggerEvent,
    };
    return async (logs, context) => {
        const events = parser.parseLogs(logs.logs);
        api_1.db.transaction(async (database) => {
            for (const event of events) {
                await eventListeners[event.name](event.data, context.slot, logs.signature, database);
            }
        });
        console.log(Array.from(events.map((event) => event.name)));
        return Array.from(events.map((event) => event.name));
    };
};
exports.buildEventListeners = buildEventListeners;
const main = async (program) => {
    const parser = new anchor_1.EventParser(program.programId, new anchor_1.BorshCoder(program.idl));
    const onLogs = (0, exports.buildEventListeners)(parser);
    program.provider.connection.onLogs(program.programId, (logs, context) => {
        console.log("[pending] signature=", logs.signature);
        onLogs(logs, context)
            .then(() => console.log("[success] signature=", logs.signature))
            .catch(() => console.log("[error] signature=", logs.signature));
    }, "finalized");
};
main(program)
    .then(() => console.log("Running worker in background..."))
    .catch(console.error);
