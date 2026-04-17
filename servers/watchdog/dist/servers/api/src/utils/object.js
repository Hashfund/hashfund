"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.safeStringify = void 0;
exports.sumBN = sumBN;
const bn_js_1 = __importDefault(require("bn.js"));
const anchor_1 = require("@coral-xyz/anchor");
function sumBN(self, mapFn, start) {
    let result = start;
    for (const item of self) {
        const value = mapFn(item);
        result = result.add(value);
    }
    return result;
}
const safeStringify = (input) => {
    return JSON.parse(JSON.stringify(input, (key, value) => {
        if (value instanceof bn_js_1.default || typeof value === "bigint")
            return value.toString();
        else if (value instanceof anchor_1.web3.PublicKey)
            return value.toBase58();
        return value;
    }));
};
exports.safeStringify = safeStringify;
