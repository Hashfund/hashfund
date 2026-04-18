"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEstimatedRaydiumCpPoolCreationFee = getEstimatedRaydiumCpPoolCreationFee;
const anchor_1 = require("@coral-xyz/anchor");
function getEstimatedRaydiumCpPoolCreationFee() {
    return new anchor_1.BN(2)
        .mul(new anchor_1.BN(10).pow(new anchor_1.BN(6)))
        .add(new anchor_1.BN(15).mul(new anchor_1.BN(10).pow(new anchor_1.BN(8))))
        .add(new anchor_1.BN(203938).mul(new anchor_1.BN(10).pow(new anchor_1.BN(1))));
}
