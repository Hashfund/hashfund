"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.onLogs = void 0;
const web3_js_1 = require("@solana/web3.js");
const program_1 = require("@hashfund/program");
const api_1 = __importDefault(require("@hashfund/api"));
const config_1 = require("./config");
const { createMint, updateMint, getOrCreateUser, createBoundingCurve, createSwap, createHash, } = api_1.default;
const onLogs = async ({ logs, signature }) => {
    const events = (0, program_1.parseLogs)(logs);
    for (const event of events) {
        if (event.Mint && event.MintTo) {
            let mintData = event.Mint;
            let mintToData = event.MintTo;
            await getOrCreateUser(mintData.creator.toBase58());
            await createMint({
                id: mintData.mint.toBase58(),
                name: mintData.name,
                creator: mintData.creator.toBase58(),
                uri: mintData.uri,
                ticker: mintData.ticker,
                timestamp: new Date(),
                reserve: mintToData.reserve.toBase58(),
                totalSupply: mintToData.amount.toString("hex"),
                signature,
            });
            continue;
        }
        if ("InitializeCurve" in event && event.InitializeCurve) {
            const data = event.InitializeCurve;
            await createBoundingCurve({
                id: data.bounding_curve.toBase58(),
                mint: data.mint.toBase58(),
                initialMarketCap: data.initial_market_cap.toString("hex"),
                curveInitialSupply: data.curve_initial_supply.toString("hex"),
                initialPrice: String(program_1.SafeMath.unwrap(data.initial_price)),
                maximumMarketCap: data.maximum_market_cap.toString("hex"),
                timestamp: new Date(),
                signature,
            });
            continue;
        }
        if ("Swap" in event && event.Swap) {
            const data = event.Swap;
            await getOrCreateUser(data.payer.toBase58());
            await createSwap({
                mint: data.mint.toBase58(),
                tradeDirection: data.trade_direction,
                amountIn: data.amount_in.toString("hex"),
                amountOut: data.amount_out.toString("hex"),
                marketCap: data.market_cap.toString("hex"),
                virtualMarketCap: data.virtual_market_cap.toString("hex"),
                timestamp: new Date(),
                payer: data.payer.toBase58(),
                signature,
            });
            continue;
        }
        if ("HashMature" in event && event.HashMature) {
            const data = event.HashMature;
            await updateMint(data.mint.toBase58(), {
                canTrade: false,
            });
            continue;
        }
        if ("HashToken" in event && event.HashToken) {
            const data = event.HashToken;
            if (data.market)
                await createHash({
                    marketId: data.market.toBase58(),
                    mint: data.token_a_mint.toBase58(),
                    ammId: data.amm.toBase58(),
                    timestamp: new Date(),
                });
            else
                await createHash({
                    mint: data.token_b_mint.toBase58(),
                    ammId: data.amm.toBase58(),
                    timestamp: new Date(),
                });
            continue;
        }
    }
};
exports.onLogs = onLogs;
async function run() {
    const connection = new web3_js_1.Connection(config_1.HTTP_RPC_ENDPOINT, {
        wsEndpoint: config_1.WSS_RPC_ENDPOINT,
    });
    connection.onLogs(program_1.HASHFUND_PROGRAM_ID, async (logs) => {
        console.log("signature=", logs.signature);
        (0, exports.onLogs)(logs).catch(console.log);
    }, "confirmed");
}
run()
    .catch((error) => {
    console.error(error);
    process.exit(1);
})
    .then(() => console.log("Running worker in background..."));
