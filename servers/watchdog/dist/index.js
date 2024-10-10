"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrInsertBoundingCurve = void 0;
require("dotenv/config");
const zeroboost_1 = require("@hashfund/zeroboost");
const anchor_1 = require("@coral-xyz/anchor");
const api_1 = require("@hashfund/api");
const error_1 = require("./error");
const utils_1 = require("./utils");
const config_1 = require("./config");
const provider = new anchor_1.AnchorProvider(new anchor_1.web3.Connection(config_1.ANCHOR_PROVIDER_URL), new anchor_1.Wallet(config_1.ANCHOR_WALLET), {
    commitment: "finalized",
});
const program = new anchor_1.Program(zeroboost_1.IDL, zeroboost_1.devnet.ZERO_BOOST_PROGRAM, provider);
const getOrInsertBoundingCurve = async (program, boundingCurveId) => {
    const boundingCurve = (0, utils_1.safeParse)(Object.assign({ id: boundingCurveId }, await program.account.boundingCurve.fetch(boundingCurveId)));
    return (0, api_1.upsertBoundingCurve)(boundingCurve);
};
exports.getOrInsertBoundingCurve = getOrInsertBoundingCurve;
const main = async (program) => {
    program.addEventListener("MintEvent", (0, error_1.catchAndRetryRuntimeError)(async (data, _slot, signature) => {
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
    }));
    program.addEventListener("SwapEvent", (0, error_1.catchAndRetryRuntimeError)(async (data, _slot, signature) => {
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
    }));
    program.addEventListener("MigrateTriggerEvent", (0, error_1.catchAndRetryRuntimeError)(async (data) => {
        const [boundingCurve] = (0, zeroboost_1.getBoundingCurvePda)(data.mint, program.programId);
        await (0, api_1.updateBoundingCurveById)(boundingCurve.toBase58(), {
            tradeable: false,
        });
        await program.methods
            .migrateFund({
            openTime: null,
        })
            .accounts({})
            .rpc();
    }));
    program.addEventListener("MigrateEvent", (0, error_1.catchAndRetryRuntimeError)(async (data) => {
        const [boundingCurve] = (0, zeroboost_1.getBoundingCurvePda)(data.mint, program.programId);
        await (0, exports.getOrInsertBoundingCurve)(program, boundingCurve);
    }));
};
main(program)
    .then(() => console.log("Running worker in background..."))
    .catch(console.error);
