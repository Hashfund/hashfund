"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const anchor_1 = require("@coral-xyz/anchor");
const fs_1 = require("fs");
const web3_js_1 = require("@solana/web3.js");
const src_1 = require("../src");
const PROGRAM_ID = new anchor_1.web3.PublicKey("G9hckfQ5yPjyqF9jTfPm2t3tBTxefgqrFrPPJsF8UJY6");
async function main() {
    var _a;
    // Load your payer keypair
    const keypairPath = process.env.HOME + "/.config/solana/id.json";
    const raw = JSON.parse((0, fs_1.readFileSync)(keypairPath, "utf-8"));
    const payer = web3_js_1.Keypair.fromSecretKey(Uint8Array.from(raw));
    const connection = new web3_js_1.Connection((0, web3_js_1.clusterApiUrl)("devnet"), "confirmed");
    const wallet = {
        publicKey: payer.publicKey,
        signTransaction: async (tx) => { tx.sign(payer); return tx; },
        signAllTransactions: async (txs) => { txs.forEach(tx => tx.sign(payer)); return txs; },
    };
    const provider = new anchor_1.AnchorProvider(connection, wallet, { commitment: "confirmed" });
    const program = new anchor_1.Program(src_1.IDL, PROGRAM_ID, provider);
    console.log("Initializing config for program:", PROGRAM_ID.toBase58());
    console.log("Payer:", payer.publicKey.toBase58());
    const { pubkeys, signature } = await (0, src_1.initializeConfig)(program, payer.publicKey, {
        metadataCreationFee: 5,
        migrationPercentageFee: 5,
        minimumCurveUsdValuation: 4000,
        maximumCurveUsdValuation: 60000,
        estimatedRaydiumCpPoolFee: (0, src_1.getEstimatedRaydiumCpPoolCreationFee)(),
    }).rpcAndKeys();
    console.log("✅ Config initialized!");
    console.log("  Config PDA:", (_a = pubkeys.config) === null || _a === void 0 ? void 0 : _a.toBase58());
    console.log("  Signature:", signature);
}
main().catch((e) => {
    console.error("❌ Error:", e.message);
    process.exit(1);
});
