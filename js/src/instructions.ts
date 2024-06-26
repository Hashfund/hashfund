import BN from "bn.js";
import { Market, MARKET_STATE_LAYOUT_V2 } from "@project-serum/serum";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountIdempotentInstruction,
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddressSync,
  NATIVE_MINT,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import {
  Connection,
  PublicKey,
  SystemProgram,
  SYSVAR_INSTRUCTIONS_PUBKEY,
  SYSVAR_RENT_PUBKEY,
  TransactionInstruction,
} from "@solana/web3.js";
import { MPL_TOKEN_METADATA_PROGRAM_ID } from "@metaplex-foundation/mpl-token-metadata";

import {
  HASHFUND_PROGRAM_ID,
  SERUM_DEVNET_PROGRAM_ID,
  SERUM_PROGRAM_ID,
} from "./config";
import {
  findMetadataPda,
  findMasterEditionPda,
  findBoundingCurvePda,
  getOrCreateAssociatedTokenAccountInstructions,
  findMintAuthorityPda,
  findVaultSignerPda,
  type PublicKeyWithSeed,
} from "./utils";
import {
  InitializeCurveSchema,
  InitializeMintTokenSchema,
  InitializeSerumMarketSchema,
  MintTokenSchema,
  InitializeRaydiumSchema,
  SwapSchema,
} from "./schema";
import { initializeAccount } from "@project-serum/serum/lib/token-instructions";
import { Liquidity } from "@raydium-io/raydium-sdk";

type InitializeMintInstructionArgs = {
  programId: PublicKey;
  sysvarRent: PublicKey;
  sysVarInstructions: PublicKey;
  systemProgram: PublicKey;
  tokenProgram: PublicKey;
  metadataProgram: string;
  payer: PublicKey;
  data: InitializeMintTokenSchema;
};

function initializeMintInstruction({
  programId,
  sysvarRent,
  sysVarInstructions,
  systemProgram,
  tokenProgram,
  metadataProgram,
  payer,
  data,
}: InitializeMintInstructionArgs) {
  const [mint] = PublicKey.findProgramAddressSync(
    [Buffer.from(data.name), Buffer.from(data.ticker), payer.toBuffer()],
    programId
  );

  const [mintAuthority] = findMintAuthorityPda(payer, mint, programId);

  const [metadataPda] = findMetadataPda(mint, metadataProgram);
  const [masterEditionPda] = findMasterEditionPda(mint, metadataProgram);

  return [
    mint,
    new TransactionInstruction({
      programId,
      keys: [
        { pubkey: sysvarRent, isSigner: false, isWritable: false },
        {
          pubkey: sysVarInstructions,
          isSigner: false,
          isWritable: false,
        },
        { pubkey: systemProgram, isSigner: false, isWritable: false },
        { pubkey: tokenProgram, isSigner: false, isWritable: false },
        { pubkey: mint, isSigner: false, isWritable: true },
        { pubkey: mintAuthority, isSigner: false, isWritable: true },
        {
          pubkey: new PublicKey(metadataProgram),
          isSigner: false,
          isWritable: true,
        },
        { pubkey: metadataPda, isSigner: false, isWritable: true },
        { pubkey: masterEditionPda, isSigner: false, isWritable: true },
        { pubkey: payer, isSigner: true, isWritable: false },
      ],
      data: data.serialize(),
    }),
  ] as const;
}

type MintTokenInstructionArgs = {
  programId: PublicKey;
  tokenProgram: PublicKey;
  mint: PublicKey;
  mintReserveAta: PublicKey;
  payer: PublicKey;
  data: MintTokenSchema;
};

function mintTokenInstruction({
  programId,
  tokenProgram,
  payer,
  mint,
  mintReserveAta,
  data,
}: MintTokenInstructionArgs) {
  const [mintAuthority] = findMintAuthorityPda(payer, mint, programId);

  return new TransactionInstruction({
    programId,
    keys: [
      { pubkey: tokenProgram, isSigner: false, isWritable: false },
      { pubkey: mint, isSigner: false, isWritable: true },
      { pubkey: mintReserveAta, isSigner: false, isWritable: true },
      { pubkey: mintAuthority, isSigner: false, isWritable: true },
      { pubkey: payer, isSigner: true, isWritable: false },
    ],
    data: data.serialize(),
  });
}

type InitializeCurveArgs = {
  programId: PublicKey;
  systemProgram: PublicKey;
  tokenProgram: PublicKey;
  tokenAMint: PublicKey;
  tokenAMintAuthority: PublicKey;
  tokenBMint: PublicKey;
  boundingCurve: PublicKey;
  boundingCurveAta: PublicKey;
  payer: PublicKey;
  solUsdFeed: PublicKey;
  data: InitializeCurveSchema;
};

function initializeCurveInstruction({
  programId,
  systemProgram,
  tokenProgram,
  tokenAMint,
  tokenAMintAuthority,
  tokenBMint,
  boundingCurve,
  boundingCurveAta,
  solUsdFeed,
  payer,
  data,
}: InitializeCurveArgs) {
  return new TransactionInstruction({
    programId,
    keys: [
      { pubkey: systemProgram, isSigner: false, isWritable: false },
      { pubkey: tokenProgram, isSigner: false, isWritable: false },
      { pubkey: tokenAMint, isSigner: false, isWritable: false },
      { pubkey: tokenAMintAuthority, isSigner: false, isWritable: false },
      { pubkey: tokenBMint, isSigner: false, isWritable: false },
      { pubkey: boundingCurve, isSigner: false, isWritable: true },
      { pubkey: boundingCurveAta, isSigner: false, isWritable: false },
      { pubkey: payer, isSigner: true, isWritable: true },
      { pubkey: solUsdFeed, isSigner: false, isWritable: false },
    ],
    data: data.serialize(),
  });
}

type InitializeSerumMarketArgs = {
  programId: PublicKey;
  rentSysVar: PublicKey;
  systemProgram: PublicKey;
  serumProgram: PublicKey;
  tokenAMint: PublicKey;
  tokenBMint: PublicKey;
  tokenAVault: PublicKey;
  tokenBVault: PublicKey;
  market: PublicKey;
  bids: PublicKey;
  asks: PublicKey;
  requestQueue: PublicKey;
  eventQueue: PublicKey;
  payer: PublicKey;
  data: InitializeSerumMarketSchema;
};

function initializeSerumMarketInstruction({
  programId,
  rentSysVar,
  serumProgram,
  tokenAMint,
  tokenBMint,
  tokenAVault,
  tokenBVault,
  market,
  bids,
  asks,
  requestQueue,
  eventQueue,
  payer,
  data,
}: InitializeSerumMarketArgs) {
  return new TransactionInstruction({
    programId,
    keys: [
      { pubkey: rentSysVar, isSigner: false, isWritable: false },
      { pubkey: serumProgram, isSigner: false, isWritable: false },
      { pubkey: tokenAMint, isSigner: false, isWritable: false },
      { pubkey: tokenBMint, isSigner: false, isWritable: false },
      { pubkey: tokenAVault, isSigner: false, isWritable: true },
      { pubkey: tokenBVault, isSigner: false, isWritable: true },
      { pubkey: market, isSigner: false, isWritable: true },
      { pubkey: bids, isSigner: false, isWritable: true },
      { pubkey: asks, isSigner: false, isWritable: true },
      { pubkey: requestQueue, isSigner: false, isWritable: true },
      { pubkey: eventQueue, isSigner: false, isWritable: true },
      { pubkey: payer, isSigner: true, isWritable: false },
    ],
    data: data.serialize(),
  });
}

type InitializeRaydiumInstructionArgs = {
  programId: PublicKey;
  sysRentVar: PublicKey;
  systemProgram: PublicKey;
  tokenProgram: PublicKey;
  associateTokenProgram: PublicKey;
  ammProgram: PublicKey;
  marketProgram: PublicKey;
  tokenAMint: PublicKey;
  tokenBMint: PublicKey;
  lpMint: PublicKey;
  market: PublicKey;
  ammPool: PublicKey;
  ammAuthority: PublicKey;
  ammTokenAVault: PublicKey;
  ammTokenBVault: PublicKey;
  ammTargetOrders: PublicKey;
  ammConfig: PublicKey;
  ammOpenOrders: PublicKey;
  ammCreateFeeDestination: PublicKey;
  boundingCurve: PublicKey;
  boundingCurveTokenAReserve: PublicKey;
  boundingCurveTokenBReserve: PublicKey;
  boundingCurveLpReserve: PublicKey;
  data: InitializeRaydiumSchema;
};

function initializeRaydiumInstruction({
  programId,
  sysRentVar,
  systemProgram,
  tokenProgram,
  associateTokenProgram,
  ammProgram,
  marketProgram,
  tokenAMint,
  tokenBMint,
  lpMint,
  market,
  ammPool,
  ammAuthority,
  ammTokenAVault,
  ammTokenBVault,
  ammTargetOrders,
  ammConfig,
  ammOpenOrders,
  ammCreateFeeDestination,
  boundingCurve,
  boundingCurveTokenAReserve,
  boundingCurveTokenBReserve,
  boundingCurveLpReserve,
  data,
}: InitializeRaydiumInstructionArgs) {
  return new TransactionInstruction({
    programId,
    keys: [
      { pubkey: sysRentVar, isSigner: false, isWritable: false },
      { pubkey: systemProgram, isSigner: false, isWritable: false },
      { pubkey: tokenProgram, isSigner: false, isWritable: false },
      { pubkey: associateTokenProgram, isSigner: false, isWritable: false },
      { pubkey: ammProgram, isSigner: false, isWritable: false },
      { pubkey: marketProgram, isSigner: false, isWritable: false },
      { pubkey: tokenAMint, isSigner: false, isWritable: false },
      { pubkey: tokenBMint, isSigner: false, isWritable: false },
      { pubkey: lpMint, isSigner: false, isWritable: false },
      { pubkey: market, isSigner: false, isWritable: false },
      { pubkey: ammPool, isSigner: false, isWritable: true },
      { pubkey: ammAuthority, isSigner: false, isWritable: true },
      { pubkey: ammTokenAVault, isSigner: false, isWritable: true },
      { pubkey: ammTokenBVault, isSigner: false, isWritable: true },
      { pubkey: ammTargetOrders, isSigner: false, isWritable: true },
      { pubkey: ammConfig, isSigner: false, isWritable: true },
      { pubkey: ammOpenOrders, isSigner: false, isWritable: true },
      { pubkey: ammCreateFeeDestination, isSigner: false, isWritable: false },
      { pubkey: boundingCurve, isSigner: false, isWritable: false },
      {
        pubkey: boundingCurveTokenAReserve,
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: boundingCurveTokenBReserve,
        isSigner: false,
        isWritable: false,
      },
      { pubkey: boundingCurveLpReserve, isSigner: false, isWritable: false },
    ],
    data: data.serialize(),
  });
}

type SwapInstructionArgs = {
  programId: PublicKey;
  systemProgram: PublicKey;
  tokenProgram: PublicKey;
  tokenAMint: PublicKey;
  tokenBMint: PublicKey;
  boundingCurve: PublicKey;
  tokenASource: PublicKey;
  tokenADestination: PublicKey;
  tokenBSource: PublicKey;
  tokenBDestination: PublicKey;
  payer: PublicKey;
  data: SwapSchema;
};

function swapInstruction({
  programId,
  systemProgram,
  tokenProgram,
  tokenAMint,
  tokenBMint,
  boundingCurve,
  payer,
  tokenASource,
  tokenADestination,
  tokenBSource,
  tokenBDestination,
  data,
}: SwapInstructionArgs) {
  return new TransactionInstruction({
    programId,
    keys: [
      { pubkey: systemProgram, isSigner: false, isWritable: false },
      { pubkey: tokenProgram, isSigner: false, isWritable: false },
      { pubkey: tokenAMint, isSigner: false, isWritable: false },
      { pubkey: tokenBMint, isSigner: false, isWritable: false },
      { pubkey: boundingCurve, isSigner: false, isWritable: true },
      { pubkey: tokenASource, isSigner: false, isWritable: true },
      { pubkey: tokenADestination, isSigner: false, isWritable: true },
      { pubkey: tokenBSource, isSigner: false, isWritable: true },
      { pubkey: tokenBDestination, isSigner: false, isWritable: true },
      { pubkey: payer, isSigner: true, isWritable: false },
    ],
    data: data.serialize(),
  });
}

type CreateMintInstructionArgs = {
  payer: PublicKey;
  data: {
    name: string;
    ticker: string;
    uri: string;
    decimals?: number;
    totalSupply?: BN;
  };
} & Partial<
  Pick<
    InitializeMintInstructionArgs,
    | "programId"
    | "systemProgram"
    | "sysVarInstructions"
    | "sysvarRent"
    | "tokenProgram"
    | "metadataProgram"
  >
>;

export function createMintInstruction({
  programId = HASHFUND_PROGRAM_ID,
  systemProgram = SystemProgram.programId,
  sysVarInstructions = SYSVAR_INSTRUCTIONS_PUBKEY,
  sysvarRent = SYSVAR_RENT_PUBKEY,
  tokenProgram = TOKEN_PROGRAM_ID,
  metadataProgram = MPL_TOKEN_METADATA_PROGRAM_ID,
  payer,
  data: {
    name,
    ticker,
    uri,
    decimals = 6,
    totalSupply = new BN(1_000_000_000).mul(new BN(10).pow(new BN(decimals))),
  },
}: CreateMintInstructionArgs) {
  let [mint, initializeInstruction] = initializeMintInstruction({
    payer,
    programId,
    systemProgram,
    tokenProgram,
    sysVarInstructions,
    sysvarRent,
    metadataProgram,
    data: new InitializeMintTokenSchema(name, ticker, uri, decimals),
  });

  let [boundingCurve] = findBoundingCurvePda(mint, programId);

  let mintReserveAta = getAssociatedTokenAddressSync(mint, boundingCurve, true);

  let createMintReserveAtaInstruction = createAssociatedTokenAccountInstruction(
    payer,
    mintReserveAta,
    boundingCurve,
    mint
  );

  let mintInstruction = mintTokenInstruction({
    payer,
    mint,
    programId,
    mintReserveAta,
    tokenProgram,
    data: new MintTokenSchema(totalSupply),
  });

  return [
    mint,
    [initializeInstruction, createMintReserveAtaInstruction, mintInstruction],
  ] as const;
}

type CreateInitializeCurveArgs = {
  connection: Connection;
  programId?: PublicKey;
  systemProgram?: PublicKey;
  tokenProgram?: PublicKey;
  tokenAMint: PublicKey;
  tokenBMint?: PublicKey;
  payer: PublicKey;
  solUsdFeed: PublicKey;
  data: {
    supplyFraction: BN;
    maximumMarketCap: BN;
  };
};

export async function createInitializeCurveInstruction({
  connection,
  programId = HASHFUND_PROGRAM_ID,
  systemProgram = SystemProgram.programId,
  tokenProgram = TOKEN_PROGRAM_ID,
  tokenAMint,
  tokenBMint = NATIVE_MINT,
  payer,
  solUsdFeed,
  data,
}: CreateInitializeCurveArgs) {
  const [boundingCurve] = findBoundingCurvePda(tokenAMint, programId);
  const [tokenAMintAuthority] = findMintAuthorityPda(
    payer,
    tokenAMint,
    programId
  );

  const boundingCurveTokenBAccountIx =
    await getOrCreateAssociatedTokenAccountInstructions(
      connection,
      tokenBMint,
      payer,
      boundingCurve,
      true
    );

  const payerTokenAAccountIx =
    await getOrCreateAssociatedTokenAccountInstructions(
      connection,
      tokenAMint,
      payer,
      payer,
      false
    );

  const payerTokenBAccountIx =
    await getOrCreateAssociatedTokenAccountInstructions(
      connection,
      tokenBMint,
      payer,
      payer,
      false
    );

  const boundingCurveAta = getAssociatedTokenAddressSync(
    tokenAMint,
    boundingCurve,
    true,
    tokenProgram
  );

  const initializeCurveIx = initializeCurveInstruction({
    programId,
    systemProgram,
    tokenProgram,
    boundingCurve,
    boundingCurveAta,
    tokenAMint,
    tokenAMintAuthority,
    tokenBMint,
    payer,
    solUsdFeed,
    data: new InitializeCurveSchema(data.supplyFraction, data.maximumMarketCap),
  });

  return [
    ...boundingCurveTokenBAccountIx,
    ...payerTokenAAccountIx,
    ...payerTokenBAccountIx,
    initializeCurveIx,
  ];
}

type CreateSerumTokenAccountInstructionsArgs = {
  connection: Connection;
  tokenProgram: PublicKey;
  tokenAVault: PublicKeyWithSeed;
  tokenBVault: PublicKeyWithSeed;
  vaultOwner: PublicKey;
} & Pick<InitializeSerumMarketArgs, "tokenAMint" | "tokenBMint" | "payer">;

export async function createSerumTokenAccountInstructions({
  connection,
  tokenProgram,
  tokenBMint,
  tokenAMint,
  tokenAVault,
  tokenBVault,
  vaultOwner,
  payer,
}: CreateSerumTokenAccountInstructionsArgs) {
  return [
    SystemProgram.createAccountWithSeed({
      space: 165,
      fromPubkey: payer,
      basePubkey: payer,
      seed: tokenAVault.seed,
      programId: tokenProgram,
      newAccountPubkey: tokenAVault.publicKey,
      lamports: await connection.getMinimumBalanceForRentExemption(165),
    }),
    SystemProgram.createAccountWithSeed({
      space: 165,
      fromPubkey: payer,
      basePubkey: payer,
      seed: tokenBVault.seed,
      programId: tokenProgram,
      newAccountPubkey: tokenBVault.publicKey,
      lamports: await connection.getMinimumBalanceForRentExemption(165),
    }),
    initializeAccount({
      account: tokenAVault.publicKey,
      mint: tokenAMint,
      owner: vaultOwner,
    }),
    initializeAccount({
      account: tokenBVault.publicKey,
      mint: tokenBMint,
      owner: vaultOwner,
    }),
  ];
}

type CreateSerumAccountInstructionsArgs = {
  connection: Connection;
  market: PublicKeyWithSeed;
  asks: PublicKeyWithSeed;
  bids: PublicKeyWithSeed;
  eventQueue: PublicKeyWithSeed;
  requestQueue: PublicKeyWithSeed;
} & Pick<InitializeSerumMarketArgs, "serumProgram" | "payer">;

export async function createSerumAccountInstructions({
  connection,
  serumProgram,
  market,
  asks,
  bids,
  eventQueue,
  requestQueue,
  payer,
}: CreateSerumAccountInstructionsArgs) {
  return [
    SystemProgram.createAccountWithSeed({
      fromPubkey: payer,
      newAccountPubkey: market.publicKey,
      seed: market.seed,
      basePubkey: payer,
      lamports: await connection.getMinimumBalanceForRentExemption(
        MARKET_STATE_LAYOUT_V2.span
      ),
      space: MARKET_STATE_LAYOUT_V2.span,
      programId: serumProgram,
    }),
    SystemProgram.createAccountWithSeed({
      fromPubkey: payer,
      newAccountPubkey: requestQueue.publicKey,
      seed: requestQueue.seed,
      basePubkey: payer,
      lamports: await connection.getMinimumBalanceForRentExemption(5120 + 12),
      space: 5120 + 12,
      programId: serumProgram,
    }),
    SystemProgram.createAccountWithSeed({
      fromPubkey: payer,
      newAccountPubkey: eventQueue.publicKey,
      seed: eventQueue.seed,
      basePubkey: payer,
      lamports: await connection.getMinimumBalanceForRentExemption(262144 + 12),
      space: 262144 + 12,
      programId: serumProgram,
    }),
    SystemProgram.createAccountWithSeed({
      fromPubkey: payer,
      newAccountPubkey: bids.publicKey,
      seed: bids.seed,
      basePubkey: payer,
      lamports: await connection.getMinimumBalanceForRentExemption(65536 + 12),
      space: 65536 + 12,
      programId: serumProgram,
    }),
    SystemProgram.createAccountWithSeed({
      fromPubkey: payer,
      newAccountPubkey: asks.publicKey,
      seed: asks.seed,
      basePubkey: payer,
      lamports: await connection.getMinimumBalanceForRentExemption(65536 + 12),
      space: 65536 + 12,
      programId: serumProgram,
    }),
  ];
}

type CreateInitializeSerumMarketInstructionArgs = {
  connection: Connection;
  tokenProgram?: PublicKey;
  tokenAMint: PublicKey;
  tokenAVault: PublicKeyWithSeed;
  tokenBVault: PublicKeyWithSeed;
  market: PublicKeyWithSeed;
  asks: PublicKeyWithSeed;
  bids: PublicKeyWithSeed;
  eventQueue: PublicKeyWithSeed;
  requestQueue: PublicKeyWithSeed;
  payer: PublicKey;
  data: {
    coinLotSize: BN;
    pcLotSize: BN;
    pcDustThreshhold: BN;
  };
} & Partial<
  Pick<
    InitializeSerumMarketArgs,
    "rentSysVar" | "systemProgram" | "serumProgram" | "programId" | "tokenBMint"
  >
>;

export async function createInitializeSerumMarketInstructions({
  connection,
  programId = HASHFUND_PROGRAM_ID,
  rentSysVar = SYSVAR_RENT_PUBKEY,
  systemProgram = SystemProgram.programId,
  tokenProgram = TOKEN_PROGRAM_ID,
  serumProgram = SERUM_PROGRAM_ID,
  tokenAMint,
  tokenBMint = NATIVE_MINT,
  tokenAVault,
  tokenBVault,
  market,
  asks,
  bids,
  payer,
  eventQueue,
  requestQueue,
  data,
}: CreateInitializeSerumMarketInstructionArgs) {
  const [vaultOwner, nonce] = findVaultSignerPda(
    market.publicKey,
    serumProgram
  );
  const [boundingCurve] = findBoundingCurvePda(tokenAMint, programId);

  const instructions0 = await createSerumTokenAccountInstructions({
    connection,
    tokenProgram,
    tokenBMint,
    tokenAMint,
    tokenAVault,
    tokenBVault,
    vaultOwner,
    payer,
  });

  const instructions1 = await createSerumAccountInstructions({
    connection,
    serumProgram,
    market,
    asks,
    bids,
    eventQueue,
    requestQueue,
    payer,
  });

  const instructions2 = [
    initializeSerumMarketInstruction({
      programId,
      rentSysVar,
      serumProgram,
      systemProgram,
      tokenAMint,
      tokenBMint,
      tokenAVault: tokenAVault.publicKey,
      tokenBVault: tokenBVault.publicKey,
      market: market.publicKey,
      asks: asks.publicKey,
      bids: bids.publicKey,
      eventQueue: eventQueue.publicKey,
      requestQueue: requestQueue.publicKey,
      payer,
      data: new InitializeSerumMarketSchema(
        data.coinLotSize,
        data.pcLotSize,
        nonce,
        data.pcDustThreshhold
      ),
    }),
  ];

  return [instructions0, instructions1, instructions2];
}

type MintInfo = {
  decimals: number;
};

type CreateRaydiumInitializeInstructionArgs = {
  payer: PublicKey;
  tokenAMintInfo: MintInfo;
  tokenBMintInfo: MintInfo;
  data: { openTime: BN; tokenAAmount: BN; tokenBAmount: BN };
} & Pick<InitializeRaydiumInstructionArgs, "tokenAMint" | "market"> &
  Partial<
    Pick<
      InitializeRaydiumInstructionArgs,
      | "programId"
      | "sysRentVar"
      | "systemProgram"
      | "tokenProgram"
      | "associateTokenProgram"
      | "ammProgram"
      | "marketProgram"
      | "tokenBMint"
    >
  >;

export function createInitializeRaydiumInstructions({
  programId = HASHFUND_PROGRAM_ID,
  sysRentVar = SYSVAR_RENT_PUBKEY,
  systemProgram = SystemProgram.programId,
  tokenProgram = TOKEN_PROGRAM_ID,
  associateTokenProgram = ASSOCIATED_TOKEN_PROGRAM_ID,
  marketProgram = SERUM_DEVNET_PROGRAM_ID,
  ammProgram = PublicKey.default,
  tokenAMint,
  tokenBMint = NATIVE_MINT,
  tokenAMintInfo,
  tokenBMintInfo,
  market,
  payer,
  data,
}: CreateRaydiumInitializeInstructionArgs) {
  const [boundingCurve] = findBoundingCurvePda(tokenAMint, programId);
  const boundingCurveTokenAReserve = getAssociatedTokenAddressSync(
    tokenAMint,
    boundingCurve,
    true
  );
  const boundingCurveTokenBReserve = getAssociatedTokenAddressSync(
    tokenAMint,
    boundingCurve,
    true
  );

  const poolInfo = Liquidity.getAssociatedPoolKeys({
    version: 5,
    marketVersion: 3,
    marketId: market,
    baseMint: tokenAMint,
    quoteMint: tokenBMint,
    baseDecimals: tokenAMintInfo.decimals,
    quoteDecimals: tokenBMintInfo.decimals,
    programId: ammProgram,
    marketProgramId: marketProgram,
  });

  let boundingCurveLpReserve = getAssociatedTokenAddressSync(
    poolInfo.lpMint,
    boundingCurve,
    true
  );
  const boundingCurveLpReserveInstruction =
    createAssociatedTokenAccountIdempotentInstruction(
      payer,
      boundingCurveLpReserve,
      boundingCurve,
      poolInfo.lpMint
    );

  return [
    boundingCurveLpReserveInstruction,
    initializeRaydiumInstruction({
      programId,
      sysRentVar,
      systemProgram,
      tokenProgram,
      associateTokenProgram,
      marketProgram,
      ammProgram,
      tokenAMint,
      tokenBMint,
      lpMint: poolInfo.lpMint,
      market,
      ammPool: poolInfo.id,
      ammTokenAVault: poolInfo.baseVault,
      ammTokenBVault: poolInfo.lpVault,
      ammAuthority: poolInfo.authority,
      ammTargetOrders: poolInfo.targetOrders,
      ammConfig: poolInfo.configId,
      ammOpenOrders: poolInfo.openOrders,
      ammCreateFeeDestination: new PublicKey(""),
      boundingCurve,
      boundingCurveTokenAReserve,
      boundingCurveTokenBReserve,
      boundingCurveLpReserve,
      data: new InitializeRaydiumSchema(
        data.tokenAAmount,
        data.tokenBAmount,
        data.openTime,
        new BN(poolInfo.nonce)
      ),
    }),
  ];
}

type CreateSwapInstructionArgs = {
  connection?: Connection;
  tokenAMint: PublicKey;
  payer: PublicKey;
  data: {
    amount: BN;
  };
} & Partial<
  Pick<
    SwapInstructionArgs,
    "programId" | "systemProgram" | "tokenProgram" | "tokenBMint"
  >
>;

export function createSwapInInstruction({
  programId = HASHFUND_PROGRAM_ID,
  systemProgram = SystemProgram.programId,
  tokenProgram = TOKEN_PROGRAM_ID,
  tokenAMint,
  tokenBMint = NATIVE_MINT,
  payer,
  data,
}: CreateSwapInstructionArgs) {
  const [boundingCurve] = findBoundingCurvePda(tokenAMint, programId);
  const tokenASource = getAssociatedTokenAddressSync(
    tokenAMint,
    boundingCurve,
    true
  );
  const tokenADestination = getAssociatedTokenAddressSync(
    tokenAMint,
    payer,
    false
  );

  const tokenBSource = getAssociatedTokenAddressSync(tokenBMint, payer);

  const tokenBDestination = getAssociatedTokenAddressSync(
    tokenBMint,
    boundingCurve,
    true
  );

  return swapInstruction({
    programId,
    systemProgram,
    tokenProgram,
    tokenAMint,
    tokenBMint,
    boundingCurve,
    tokenASource,
    tokenADestination,
    tokenBSource,
    tokenBDestination,
    payer,
    data: new SwapSchema(data.amount, 0),
  });
}

export async function createSwapOutInstruction({
  connection,
  programId = HASHFUND_PROGRAM_ID,
  systemProgram = SystemProgram.programId,
  tokenProgram = TOKEN_PROGRAM_ID,
  tokenAMint,
  tokenBMint = NATIVE_MINT,
  payer,
  data,
}: CreateSwapInstructionArgs & { connection: Connection }) {
  const [boundingCurve] = findBoundingCurvePda(tokenAMint, programId);

  const tokenASource = getAssociatedTokenAddressSync(tokenAMint, payer, false);
  const tokenADestination = getAssociatedTokenAddressSync(
    tokenAMint,
    boundingCurve,
    true
  );

  const tokenBSource = getAssociatedTokenAddressSync(
    tokenBMint,
    boundingCurve,
    true
  );

  const tokenBDestination = getAssociatedTokenAddressSync(
    tokenBMint,
    payer,
    false
  );

  const tokenBDestinationAccountIx =
    await getOrCreateAssociatedTokenAccountInstructions(
      connection,
      tokenBMint,
      payer,
      payer,
      false
    );

  return [
    ...tokenBDestinationAccountIx,
    swapInstruction({
      programId,
      systemProgram,
      tokenProgram,
      tokenAMint,
      tokenBMint,
      boundingCurve,
      tokenASource,
      tokenADestination,
      tokenBSource,
      tokenBDestination,
      payer,
      data: new SwapSchema(data.amount, 1),
    }),
  ];
}
