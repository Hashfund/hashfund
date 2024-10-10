"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ANCHOR_WALLET = exports.ANCHOR_PROVIDER_URL = void 0;
require("dotenv/config");
const bs58_1 = __importDefault(require("bs58"));
const anchor_1 = require("@coral-xyz/anchor");
exports.ANCHOR_PROVIDER_URL = process.env.ANCHOR_PROVIDER_URL;
exports.ANCHOR_WALLET = anchor_1.web3.Keypair.fromSecretKey(Uint8Array.from(bs58_1.default.decode(process.env.ANCHOR_WALLET)));
