"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sleep = exports.safeFetch = exports.omit = exports.safeParse = void 0;
const xior_1 = __importDefault(require("xior"));
const anchor_1 = require("@coral-xyz/anchor");
const safeParse = (input) => {
    const proxy = (input) => {
        if (Array.isArray(input))
            return input.map(exports.safeParse);
        if (typeof input === "object" && input.constructor === Object) {
            const result = {};
            for (const [key, value] of Object.entries(input)) {
                if (value instanceof anchor_1.BN)
                    result[key] = BigInt(value.toString());
                else if (value instanceof anchor_1.web3.PublicKey)
                    result[key] = value.toBase58();
                else
                    result[key] = proxy(value);
            }
            return result;
        }
        return input;
    };
    return proxy(input);
};
exports.safeParse = safeParse;
const omit = (value, ...keys) => {
    for (const key of keys) {
        delete value[key];
    }
    return value;
};
exports.omit = omit;
const safeFetch = (uri) => xior_1.default
    .get(uri)
    .then(({ data }) => data)
    .catch(() => null);
exports.safeFetch = safeFetch;
const sleep = (duration) => new Promise((resolve) => setTimeout(() => resolve(0), duration));
exports.sleep = sleep;
