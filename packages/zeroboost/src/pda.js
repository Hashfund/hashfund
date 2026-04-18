"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCreatorConfig = exports.getBoundingCurveConfig = exports.getBoundingCurveReservePda = exports.getBoundingCurvePda = exports.getUserPositionPda = exports.getMintPda = exports.getConfigPda = void 0;
const anchor_1 = require("@coral-xyz/anchor");
const spl_token_1 = require("@solana/spl-token");
const _1 = require(".");
const getConfigPda = (programId = _1.ZERO_BOOST_PROGRAM) => anchor_1.web3.PublicKey.findProgramAddressSync([Buffer.from("zeroboost")], programId);
exports.getConfigPda = getConfigPda;
const getMintPda = (name, symbol, creator, programId = _1.ZERO_BOOST_PROGRAM) => {
    const seeds = [name, symbol].map(Buffer.from);
    return anchor_1.web3.PublicKey.findProgramAddressSync([...seeds, creator.toBytes()], programId);
};
exports.getMintPda = getMintPda;
const getUserPositionPda = (payer, mint, programId = _1.ZERO_BOOST_PROGRAM) => {
    return anchor_1.web3.PublicKey.findProgramAddressSync([Buffer.from("user_position"), payer.toBytes(), mint.toBytes()], programId);
};
exports.getUserPositionPda = getUserPositionPda;
const getBoundingCurvePda = (mint, programId = _1.ZERO_BOOST_PROGRAM) => {
    const seeds = [mint.toBuffer(), Buffer.from("curve")];
    return anchor_1.web3.PublicKey.findProgramAddressSync(seeds, programId);
};
exports.getBoundingCurvePda = getBoundingCurvePda;
const getBoundingCurveReservePda = (boundingCurve, programId = _1.ZERO_BOOST_PROGRAM) => {
    const seeds = [boundingCurve.toBuffer(), Buffer.from("curve_reserve")];
    return anchor_1.web3.PublicKey.findProgramAddressSync(seeds, programId);
};
exports.getBoundingCurveReservePda = getBoundingCurveReservePda;
const getBoundingCurveConfig = (mint, pair, programId = _1.ZERO_BOOST_PROGRAM) => {
    const [boundingCurve] = (0, exports.getBoundingCurvePda)(mint, programId);
    const [boundingCurveReserve] = (0, exports.getBoundingCurveReservePda)(boundingCurve, programId);
    const boundingCurveAta = (0, spl_token_1.getAssociatedTokenAddressSync)(mint, boundingCurve, true);
    const boundingCurveReserveAta = (0, spl_token_1.getAssociatedTokenAddressSync)(mint, boundingCurveReserve, true);
    const boundingCurveReservePairAta = (0, spl_token_1.getAssociatedTokenAddressSync)(pair, boundingCurveReserve, true);
    return {
        boundingCurve,
        boundingCurveReserve,
        boundingCurveAta,
        boundingCurveReserveAta,
        boundingCurveReservePairAta,
    };
};
exports.getBoundingCurveConfig = getBoundingCurveConfig;
const getCreatorConfig = (mint, pair) => { };
exports.getCreatorConfig = getCreatorConfig;
