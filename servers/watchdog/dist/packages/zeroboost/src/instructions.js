"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.migrateFund = exports.rawSwap = exports.swap = exports.mintToken = exports.initializeConfig = void 0;
const anchor_1 = require("@coral-xyz/anchor");
const spl_token_1 = require("@solana/spl-token");
const raydium_sdk_v2_1 = require("@raydium-io/raydium-sdk-v2");
const umi_1 = require("@metaplex-foundation/umi");
const umi_bundle_defaults_1 = require("@metaplex-foundation/umi-bundle-defaults");
const mpl_token_metadata_1 = require("@metaplex-foundation/mpl-token-metadata");
const _1 = require(".");
const pda_1 = require("./pda");
const initializeConfig = (program, admin, params, programId = _1.devnet.ZERO_BOOST_PROGRAM) => {
    const [config] = (0, pda_1.getConfigPda)(programId);
    return program.methods.initializeConfig(params).accounts({ config, admin });
};
exports.initializeConfig = initializeConfig;
const mintToken = (program, pair, creator, params, tokenMetadataProgram = mpl_token_metadata_1.MPL_TOKEN_METADATA_PROGRAM_ID, metadataFeeReciever = _1.devnet.ZERO_BOOST_METADATA_FEE_RECIEVER) => {
    const programId = program.programId;
    const [config] = (0, pda_1.getConfigPda)(programId);
    const [mint] = (0, pda_1.getMintPda)(params.name, params.symbol, creator, programId);
    const [metadata] = (0, mpl_token_metadata_1.findMetadataPda)((0, umi_bundle_defaults_1.createUmi)(program.provider.connection), {
        mint: (0, umi_1.publicKey)(mint),
    });
    const { boundingCurve, boundingCurveAta, boundingCurveReserve, boundingCurveReserveAta, boundingCurveReservePairAta, } = (0, pda_1.getBoundingCurveConfig)(mint, pair, programId);
    return program.methods.mintToken(params).accounts({
        mint,
        pair,
        config,
        creator,
        metadata,
        boundingCurve,
        boundingCurveAta,
        boundingCurveReserve,
        boundingCurveReserveAta,
        boundingCurveReservePairAta,
        metadataFeeReciever,
        tokenMetadataProgram,
    });
};
exports.mintToken = mintToken;
const swap = async (program, mint, payer, params, feeReceiver = _1.devnet.ZERO_BOOST_MIGRATION_FEE_RECIEVER) => {
    const programId = program.programId;
    const [config] = (0, pda_1.getConfigPda)(programId);
    const [boundingCurve] = (0, pda_1.getBoundingCurvePda)(mint, programId);
    const { pair } = await program.account.boundingCurve.fetch(boundingCurve);
    const { boundingCurveReserve, boundingCurveReserveAta, boundingCurveReservePairAta, } = (0, pda_1.getBoundingCurveConfig)(mint, pair, programId);
    const payerAta = (0, spl_token_1.getAssociatedTokenAddressSync)(mint, payer);
    const payerPairAta = (0, spl_token_1.getAssociatedTokenAddressSync)(pair, payer);
    const feeReceiverPairAta = (0, spl_token_1.getAssociatedTokenAddressSync)(pair, feeReceiver);
    const [userPosition] = anchor_1.web3.PublicKey.findProgramAddressSync([Buffer.from("user_position"), payer.toBytes(), mint.toBytes()], programId);
    return program.methods.swap(params).accounts({
        mint,
        pair,
        payer,
        payerAta,
        payerPairAta,
        feeReceiver,
        feeReceiverPairAta,
        userPosition,
        config,
        boundingCurve,
        boundingCurveReserve,
        boundingCurveReserveAta,
        boundingCurveReservePairAta,
    });
};
exports.swap = swap;
const rawSwap = async (program, mint, pair, payer, params, feeReceiver = _1.devnet.ZERO_BOOST_MIGRATION_FEE_RECIEVER) => {
    const programId = program.programId;
    const [config] = (0, pda_1.getConfigPda)(programId);
    const [boundingCurve] = (0, pda_1.getBoundingCurvePda)(mint, programId);
    const { boundingCurveReserve, boundingCurveReserveAta, boundingCurveReservePairAta, } = (0, pda_1.getBoundingCurveConfig)(mint, pair, programId);
    const payerAta = (0, spl_token_1.getAssociatedTokenAddressSync)(mint, payer);
    const payerPairAta = (0, spl_token_1.getAssociatedTokenAddressSync)(pair, payer);
    const feeReceiverPairAta = (0, spl_token_1.getAssociatedTokenAddressSync)(pair, feeReceiver);
    const [userPosition] = anchor_1.web3.PublicKey.findProgramAddressSync([Buffer.from("user_position"), payer.toBytes(), mint.toBytes()], programId);
    return program.methods.swap(params).accounts({
        mint,
        pair,
        payer,
        payerAta,
        payerPairAta,
        feeReceiver,
        feeReceiverPairAta,
        userPosition,
        config,
        boundingCurve,
        boundingCurveReserve,
        boundingCurveReserveAta,
        boundingCurveReservePairAta,
    });
};
exports.rawSwap = rawSwap;
const migrateFund = async (program, boundingCurve, payer, params, raydiumCpPoolProgram = _1.devnet.RAYDIUM_CP_POOL_PROGRAM, raydiumCpPoolFeeReciever = _1.devnet.RAYDIUM_CP_FEE_RECIEVER) => {
    const programId = program.programId;
    const [config] = (0, pda_1.getConfigPda)(programId);
    const { mint, pair } = await program.account.boundingCurve.fetch(boundingCurve);
    const payerPairAta = (0, spl_token_1.getAssociatedTokenAddressSync)(pair, payer);
    const { boundingCurveAta, boundingCurveReserve, boundingCurveReserveAta, boundingCurveReservePairAta, } = (0, pda_1.getBoundingCurveConfig)(mint, pair, programId);
    const { publicKey: configId } = (0, raydium_sdk_v2_1.getPdaAmmConfigId)(raydiumCpPoolProgram, 0);
    const poolkeys = (0, raydium_sdk_v2_1.getCreatePoolKeys)({
        configId,
        mintA: pair,
        mintB: mint,
        programId: raydiumCpPoolProgram,
    });
    const boundingCurveReserveLpAta = (0, spl_token_1.getAssociatedTokenAddressSync)(poolkeys.lpMint, boundingCurveReserve, true);
    return program.methods.migrateFund(params).accounts({
        pair,
        mint,
        config,
        payer,
        payerPairAta,
        boundingCurve,
        boundingCurveAta,
        boundingCurveReserve,
        boundingCurveReserveAta,
        boundingCurveReservePairAta,
        boundingCurveReserveLpAta,
        ammConfig: poolkeys.configId,
        ammAuthority: poolkeys.authority,
        ammLpMint: poolkeys.lpMint,
        ammMintVault: poolkeys.vaultB,
        ammPairVault: poolkeys.vaultA,
        ammProgram: raydiumCpPoolProgram,
        ammFeeReceiver: raydiumCpPoolFeeReciever,
        ammPoolState: poolkeys.poolId,
        ammObservableState: poolkeys.observationId,
    });
};
exports.migrateFund = migrateFund;
