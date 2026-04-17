"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unsafeBnToNumber = exports.unsafeBN = exports.safeBN = void 0;
const anchor_1 = require("@coral-xyz/anchor");
/**
 * Safely convert any value to a BN with specified decimals.
 * Standardizes on BigInt conversion to avoid precision loss from numbers.
 */
const safeBN = function (value, decimals = 9 // Default to 9 (e.g. SOL)
) {
    let input;
    if (value instanceof anchor_1.BN) {
        return value;
    }
    const multiplier = BigInt(10 ** decimals);
    switch (typeof value) {
        case "bigint":
            input = value; // Assumed to be already scaled or raw? 
            // Wait, usually if it's bigint it's already a raw value.
            return new anchor_1.BN(value.toString());
        case "number":
            // Be careful with float precision
            input = BigInt(Math.round(value * Number(multiplier)));
            break;
        case "string":
            if (value.includes(".")) {
                const [int, frac] = value.split(".");
                const fracPad = frac.padEnd(decimals, "0").slice(0, decimals);
                input = BigInt(int) * multiplier + BigInt(fracPad);
            }
            else {
                input = BigInt(value) * multiplier;
            }
            break;
        default:
            // Fallback for other objects
            return new anchor_1.BN(value.toString());
    }
    return new anchor_1.BN(input.toString());
};
exports.safeBN = safeBN;
/**
 * Divides a BN by 10^decimals, returning a new BN.
 */
const unsafeBN = function (value, decimals = 9) {
    return value.div(new anchor_1.BN(10).pow(new anchor_1.BN(decimals)));
};
exports.unsafeBN = unsafeBN;
/**
 * Safely converts a large BN to a number for display.
 * Avoids .toNumber() which throws if > 53 bits.
 */
const unsafeBnToNumber = function (value, decimals = 9) {
    const s = value.toString();
    if (s.length <= decimals) {
        return parseFloat("0." + s.padStart(decimals, "0"));
    }
    const intPart = s.slice(0, s.length - decimals);
    const fracPart = s.slice(s.length - decimals);
    return parseFloat(intPart + "." + fracPart);
};
exports.unsafeBnToNumber = unsafeBnToNumber;
