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
exports.ANCHOR_WALLET = exports.ANCHOR_PROVIDER_URL = void 0;
require("dotenv/config");
const fs = __importStar(require("fs"));
const anchor_1 = require("@coral-xyz/anchor");
exports.ANCHOR_PROVIDER_URL = process.env.ANCHOR_PROVIDER_URL;
// Load the keypair from environment variable (JSON array string) or local file fallback
function loadKeypair() {
    const envKey = process.env.WALLET_PRIVATE_KEY;
    if (envKey) {
        try {
            return anchor_1.web3.Keypair.fromSecretKey(Uint8Array.from(JSON.parse(envKey)));
        }
        catch (e) {
            console.error("Failed to parse WALLET_PRIVATE_KEY from environment");
        }
    }
    const localPath = process.env.KEYPAIR_PATH || "../../packages/zeroboost/target/deploy/zeroboost-keypair.json";
    try {
        if (fs.existsSync(localPath)) {
            return anchor_1.web3.Keypair.fromSecretKey(Uint8Array.from(JSON.parse(fs.readFileSync(localPath, "utf8"))));
        }
    }
    catch (e) {
        console.warn(`Local keypair not found at ${localPath}. Watchdog may fail to sign transactions.`);
    }
    // Fallback to a random keypair to prevent immediate crash if only reading is required
    return anchor_1.web3.Keypair.generate();
}
exports.ANCHOR_WALLET = loadKeypair();
