import BN from "bn.js";
import { Market } from "@project-serum/serum";
import { initializeAccount } from "@project-serum/serum/lib/token-instructions";
import {
  getCreatePoolKeys,
  jsonInfo2PoolKeys,
  getAssociatedPoolKeys,
} from "@raydium-io/raydium-sdk-v2";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
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
  RAYDIUM_CREATE_POOL_FEE_ADDRESS,
  RAYDIUM_DEVNET_CREATE_POOL_FEE_ADDRESS,
  RAYDIUM_DEVNET_OPEN_BOOK_PROGRAM_ID,
  RAYDIUM_DEVNET_PROGRAM_ID,
  RAYDIUM_OPEN_BOOK_PROGRAM_ID,
  RAYDIUM_PROGRAM_ID,
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
  findBoundingCurveReservePda,
} from "./utils";
import {
  InitializeCurveSchema,
  InitializeMintTokenSchema,
  InitializeSerumMarketSchema,
  MintTokenSchema,
  InitializeRaydiumSchema,
  SwapSchema,
} from "./schema";
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
  boundingCurve: PublicKey;
  boundingCurveReserve: PublicKey;
  payer: PublicKey;
  data: MintTokenSchema;
};

function mintTokenInstruction({
  programId,
  tokenProgram,
  payer,
  mint,
  mintReserveAta,
  boundingCurve,
  boundingCurveReserve,
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
      { pubkey: boundingCurve, isSigner: false, isWritable: true },
      { pubkey: boundingCurveReserve, isSigner: false, isWritable: true },
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
  tokenBMint: PublicKey;
  tokenAMintAuthority: PublicKey;
  tokenAReserveAta: PublicKey;
  boundingCurve: PublicKey;
  boundingCurveReserve: PublicKey;
  payer: PublicKey;
  solUsdFeed: PublicKey;
  data: InitializeCurveSchema;
};

function initializeCurveInstruction({
  programId,
  systemProgram,
  tokenProgram,
  tokenAMint,
  tokenBMint,
  tokenAMintAuthority,
  tokenAReserveAta,
  boundingCurve,
  boundingCurveReserve,
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
      { pubkey: tokenBMint, isSigner: false, isWritable: false },
      { pubkey: tokenAMintAuthority, isSigner: false, isWritable: false },
      { pubkey: tokenAReserveAta, isSigner: false, isWritable: false },
      { pubkey: boundingCurve, isSigner: false, isWritable: true },
      { pubkey: boundingCurveReserve, isSigner: false, isWritable: true },
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
  boundingCurveReserve: PublicKey;
  boundingCurveTokenAReserve: PublicKey;
  boundingCurveTokenBReserve: PublicKey;
  boundingCurveLpReserve: PublicKey;
  payer: PublicKey;
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
  boundingCurveReserve,
  boundingCurveTokenAReserve,
  boundingCurveTokenBReserve,
  boundingCurveLpReserve,
  payer,
  data,
}: InitializeRaydiumInstructionArgs) {
  return new TransactionInstruction({
    programId,
    keys: [
      { pubkey: sysRentVar, isSigner: false, isWritable: false },
      { pubkey: systemProgram, isSigner: false, isWritable: false },
      { pubkey: tokenProgram, isSigner: false, isWritable: false },
      { pubkey: associateTokenProgram, isSigner: false, isWritable: false },
      { pubkey: ammProgram, isSigner: false, isWritable: true },
      { pubkey: marketProgram, isSigner: false, isWritable: true },

      { pubkey: tokenAMint, isSigner: false, isWritable: true },
      { pubkey: tokenBMint, isSigner: false, isWritable: true },
      { pubkey: lpMint, isSigner: false, isWritable: true },

      { pubkey: market, isSigner: false, isWritable: true },

      { pubkey: ammPool, isSigner: false, isWritable: true },
      { pubkey: ammAuthority, isSigner: false, isWritable: false },
      { pubkey: ammTokenAVault, isSigner: false, isWritable: true },
      { pubkey: ammTokenBVault, isSigner: false, isWritable: true },
      { pubkey: ammTargetOrders, isSigner: false, isWritable: true },
      { pubkey: ammConfig, isSigner: false, isWritable: false },
      { pubkey: ammOpenOrders, isSigner: false, isWritable: true },
      { pubkey: ammCreateFeeDestination, isSigner: false, isWritable: true },

      { pubkey: boundingCurve, isSigner: false, isWritable: true },
      { pubkey: boundingCurveReserve, isSigner: false, isWritable: true },
      {
        pubkey: boundingCurveTokenAReserve,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: boundingCurveTokenBReserve,
        isSigner: false,
        isWritable: true,
      },
      { pubkey: boundingCurveLpReserve, isSigner: false, isWritable: true },
      { pubkey: payer, isSigner: true, isWritable: true },
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
  tokenASource: PublicKey;
  tokenBSource: PublicKey;
  tokenADestination: PublicKey;
  tokenBDestination: PublicKey;
  boundingCurve: PublicKey;
  boundingCurveReserve: PublicKey;

  payer: PublicKey;
  data: SwapSchema;
};

function swapInstruction({
  programId,
  systemProgram,
  tokenProgram,
  tokenAMint,
  tokenBMint,
  tokenASource,
  tokenBSource,
  tokenADestination,
  tokenBDestination,
  boundingCurve,
  boundingCurveReserve,
  payer,
  data,
}: SwapInstructionArgs) {
  return new TransactionInstruction({
    programId,
    keys: [
      { pubkey: systemProgram, isSigner: false, isWritable: false },
      { pubkey: tokenProgram, isSigner: false, isWritable: false },
      { pubkey: tokenAMint, isSigner: false, isWritable: false },
      { pubkey: tokenBMint, isSigner: false, isWritable: false },
      { pubkey: tokenASource, isSigner: false, isWritable: true },
      { pubkey: tokenBSource, isSigner: false, isWritable: true },
      { pubkey: tokenADestination, isSigner: false, isWritable: true },
      { pubkey: tokenBDestination, isSigner: false, isWritable: true },
      { pubkey: boundingCurve, isSigner: false, isWritable: true },
      { pubkey: boundingCurveReserve, isSigner: false, isWritable: true },
      { pubkey: payer, isSigner: true, isWritable: true },
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

  const [boundingCurve] = findBoundingCurvePda(mint, programId);
  const [boundingCurveReserve] = findBoundingCurveReservePda(
    boundingCurve,
    programId
  );

  const mintReserveAta = getAssociatedTokenAddressSync(
    mint,
    boundingCurveReserve,
    true
  );

  const createMintReserveAtaInstruction =
    createAssociatedTokenAccountInstruction(
      payer,
      mintReserveAta,
      boundingCurveReserve,
      mint
    );

  let mintInstruction = mintTokenInstruction({
    payer,
    mint,
    programId,
    mintReserveAta,
    tokenProgram,
    boundingCurve,
    boundingCurveReserve,
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
  const [boundingCurveReserve] = findBoundingCurveReservePda(
    boundingCurve,
    programId
  );
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
      boundingCurveReserve,
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
    boundingCurveReserve,
    true,
    tokenProgram
  );

  const initializeCurveIx = initializeCurveInstruction({
    programId,
    systemProgram,
    tokenProgram,
    boundingCurve,
    boundingCurveReserve,
    tokenAReserveAta: boundingCurveAta,
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
        Market.getLayout(serumProgram).span
      ),
      space: Market.getLayout(serumProgram).span,
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
  serumProgram = RAYDIUM_DEVNET_OPEN_BOOK_PROGRAM_ID,
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
  tokenBMintInfo?: MintInfo;
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
      | "ammCreateFeeDestination"
      | "tokenBMint"
    >
  >;

export function createInitializeRaydiumInstructions({
  programId = HASHFUND_PROGRAM_ID,
  sysRentVar = SYSVAR_RENT_PUBKEY,
  systemProgram = SystemProgram.programId,
  tokenProgram = TOKEN_PROGRAM_ID,
  associateTokenProgram = ASSOCIATED_TOKEN_PROGRAM_ID,
  marketProgram = RAYDIUM_DEVNET_OPEN_BOOK_PROGRAM_ID,
  ammProgram = RAYDIUM_DEVNET_PROGRAM_ID,
  ammCreateFeeDestination = RAYDIUM_DEVNET_CREATE_POOL_FEE_ADDRESS,
  tokenAMint,
  tokenBMint = NATIVE_MINT,
  tokenAMintInfo,
  tokenBMintInfo = {
    decimals: 9,
  },
  market,
  payer,
  data,
}: CreateRaydiumInitializeInstructionArgs) {
  const [boundingCurve] = findBoundingCurvePda(tokenAMint, programId);
  const [boundingCurveReserve] = findBoundingCurveReservePda(
    boundingCurve,
    programId
  );
  const boundingCurveTokenAReserve = getAssociatedTokenAddressSync(
    tokenAMint,
    boundingCurveReserve,
    true
  );
  const boundingCurveTokenBReserve = getAssociatedTokenAddressSync(
    tokenBMint,
    boundingCurveReserve,
    true
  );

  const poolInfo = getAssociatedPoolKeys({
    version: 4,
    marketVersion: 3,
    programId: ammProgram,
    marketId: market,
    marketProgramId: marketProgram,
    baseMint: tokenAMint,
    quoteMint: tokenBMint,
    baseDecimals: tokenAMintInfo.decimals,
    quoteDecimals: tokenBMintInfo.decimals,
  });

  console.log(poolInfo.id.toBase58())

  let boundingCurveLpReserve = getAssociatedTokenAddressSync(
    poolInfo.lpMint,
    boundingCurveReserve,
    true
  );

  

  return initializeRaydiumInstruction({
    programId,
    sysRentVar,
    systemProgram,
    tokenProgram,
    associateTokenProgram,
    marketProgram,
    ammProgram,
    tokenAMint,
    tokenBMint,
    market,
    ammCreateFeeDestination,
    payer,
    boundingCurve,
    boundingCurveReserve,
    boundingCurveTokenAReserve,
    boundingCurveTokenBReserve,
    boundingCurveLpReserve,
    lpMint: poolInfo.lpMint,
    ammPool: poolInfo.id,
    ammTokenAVault: poolInfo.baseVault,
    ammTokenBVault: poolInfo.quoteVault,
    ammAuthority: poolInfo.authority,
    ammTargetOrders: poolInfo.targetOrders,
    ammConfig: poolInfo.configId,
    ammOpenOrders: poolInfo.openOrders,
    data: new InitializeRaydiumSchema(
      data.tokenAAmount,
      data.tokenBAmount,
      data.openTime,
      new BN(poolInfo.nonce)
    ),
  });
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
  const [boundingCurveReserve] = findBoundingCurveReservePda(
    boundingCurve,
    programId
  );

  const tokenASource = getAssociatedTokenAddressSync(
    tokenAMint,
    boundingCurveReserve,
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
    boundingCurveReserve,
    true
  );

  return swapInstruction({
    programId,
    systemProgram,
    tokenProgram,
    tokenAMint,
    tokenBMint,
    tokenASource,
    tokenBSource,
    tokenADestination,
    tokenBDestination,
    boundingCurve,
    boundingCurveReserve,
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
  const [boundingCurveReserve] = findBoundingCurveReservePda(
    boundingCurve,
    programId
  );

  const tokenASource = getAssociatedTokenAddressSync(tokenAMint, payer, false);
  const tokenADestination = getAssociatedTokenAddressSync(
    tokenAMint,
    boundingCurveReserve,
    true
  );

  const tokenBSource = getAssociatedTokenAddressSync(
    tokenBMint,
    boundingCurveReserve,
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
      tokenASource,
      tokenBSource,
      tokenADestination,
      tokenBDestination,
      boundingCurve,
      boundingCurveReserve,
      payer,
      data: new SwapSchema(data.amount, 1),
    }),
  ];
}
