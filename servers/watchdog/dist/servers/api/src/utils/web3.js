"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAddress = void 0;
const anchor_1 = require("@coral-xyz/anchor");
const isAddress = (value) => {
    try {
        new anchor_1.web3.PublicKey(value);
        return true;
    }
    catch {
        return false;
    }
};
exports.isAddress = isAddress;
