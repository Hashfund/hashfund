"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const zeroboost_1 = require("@hashfund/zeroboost");
const anchor_1 = require("@coral-xyz/anchor");
const http = __importStar(require("http"));
const _1 = require(".");
const config_1 = require("./config");
// Small HTTP server to satisfy Render's health check requirement for Web Services
const PORT = Number(process.env.PORT || 10000);
http.createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("OK");
}).listen(PORT, "0.0.0.0", () => {
    console.log(`[Watchdog] Health check server listening on port ${PORT}`);
});
const provider = new anchor_1.AnchorProvider(new anchor_1.web3.Connection(config_1.ANCHOR_PROVIDER_URL), new anchor_1.Wallet(config_1.ANCHOR_WALLET), {
    commitment: "confirmed",
});
const program = new anchor_1.Program(zeroboost_1.IDL, zeroboost_1.devnet.ZERO_BOOST_PROGRAM, provider);
const main = async (program) => {
    const onLogs = (0, _1.buildEventListeners)(program);
    program.provider.connection.onLogs(program.programId, (logs) => {
        console.log("[pending] signature=", logs.signature);
        onLogs(logs)
            .then(() => console.log("[success] signature=", logs.signature))
            .catch((error) => {
            console.log("[error] signature=", logs.signature);
            error.log();
        });
    }, "finalized");
};
main(program)
    .then(() => console.log("Running worker in background..."))
    .catch(console.error);
