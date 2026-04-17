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
const anchor = __importStar(require("@coral-xyz/anchor"));
const anchor_1 = require("@coral-xyz/anchor");
const src_1 = require("../src");
const web3_js_1 = require("@solana/web3.js");
async function main() {
    // Configure the client to use the provider from environment or anchor.toml
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);
    const programId = new web3_js_1.PublicKey("G9hckfQ5yPjyqF9jTfPm2t3tBTxefgqrFrPPJsF8UJY6");
    const program = new anchor_1.Program(src_1.IDL, programId, provider);
    const admin = provider.wallet.publicKey;
    console.log("Admin:", admin.toBase58());
    console.log("Program ID:", program.programId.toBase58());
    // Current production/devnet config values
    const metadataCreationFee = 5;
    const migrationPercentageFee = 5;
    const minimumCurveUsdValuation = 4000;
    const maximumCurveUsdValuation = 60000;
    const estimatedRaydiumCpPoolFee = (0, src_1.getEstimatedRaydiumCpPoolCreationFee)();
    console.log("Initializing config on Devnet...");
    try {
        const signature = await (0, src_1.initializeConfig)(program, admin, {
            metadataCreationFee,
            migrationPercentageFee,
            minimumCurveUsdValuation,
            maximumCurveUsdValuation,
            estimatedRaydiumCpPoolFee,
        }).rpc();
        console.log("Success! Transaction signature:", signature);
    }
    catch (err) {
        console.error("Error initializing config:", err);
        if (err.logs) {
            console.error("Logs:", err.logs);
        }
    }
}
main().then(() => process.exit(0), (err) => {
    console.error(err);
    process.exit(1);
});
