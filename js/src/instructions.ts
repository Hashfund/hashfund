import BN from "bn.js";
import {
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

import { HASHFUND_PROGRAM_ID } from "./config";
import {
  findMetadataPda,
  findMasterEditionPda,
  findBoundingCurvePda,
  getOrCreateAssociatedTokenAccountInstructions,
} from "./utils";
import {
  InitializeCurveSchema,
  InitializeMintTokenSchema,
  MintTokenSchema,
  SwapSchema,
} from "./schema";

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
  const [mintAuthority] = PublicKey.findProgramAddressSync(
    [Buffer.from("mint_authority"), payer.toBuffer()],
    programId
  );

  const [mint] = PublicKey.findProgramAddressSync(
    [Buffer.from(data.name), Buffer.from(data.ticker), payer.toBuffer()],
    programId
  );

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
  const [mintAuthority] = PublicKey.findProgramAddressSync(
    [Buffer.from("mint_authority"), payer.toBuffer()],
    programId
  );

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
  tokenAMint: PublicKey;
  tokenBMint: PublicKey;
  boundingCurve: PublicKey;
  payer: PublicKey;
  data: InitializeCurveSchema;
};

function initializeCurveInstruction({
  programId,
  systemProgram,
  tokenAMint,
  tokenBMint,
  boundingCurve,
  payer,
  data,
}: InitializeCurveArgs) {
  return new TransactionInstruction({
    programId,
    keys: [
      { pubkey: systemProgram, isSigner: false, isWritable: false },
      { pubkey: tokenAMint, isSigner: false, isWritable: false },
      { pubkey: tokenBMint, isSigner: false, isWritable: false },
      { pubkey: boundingCurve, isSigner: false, isWritable: true },
      { pubkey: payer, isSigner: false, isWritable: true },
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
  tokenAMint: PublicKey;
  tokenBMint?: PublicKey;
  payer: PublicKey;
  data: {
    initialBuyAmount: BN;
    maximumMarketCap: BN;
  };
};

export async function createInitializeCurveInstruction({
  connection,
  programId = HASHFUND_PROGRAM_ID,
  systemProgram = SystemProgram.programId,
  tokenAMint,
  tokenBMint = NATIVE_MINT,
  payer,
  data,
}: CreateInitializeCurveArgs) {
  const [boundingCurve] = findBoundingCurvePda(tokenAMint, programId);

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

  const initializeCurveIx = initializeCurveInstruction({
    programId,
    systemProgram,
    boundingCurve,
    tokenAMint,
    tokenBMint,
    payer,
    data: new InitializeCurveSchema(
      data.initialBuyAmount,
      data.maximumMarketCap
    ),
  });

  return [
    ...boundingCurveTokenBAccountIx,
    ...payerTokenAAccountIx,
    ...payerTokenBAccountIx,
    initializeCurveIx,
  ];
}

type CreateSwapArgs = {
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
}: CreateSwapArgs) {
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

export function createSwapOutInstruction({
  programId = HASHFUND_PROGRAM_ID,
  systemProgram = SystemProgram.programId,
  tokenProgram = TOKEN_PROGRAM_ID,
  tokenAMint,
  tokenBMint = NATIVE_MINT,
  payer,
  data,
}: CreateSwapArgs) {
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
    data: new SwapSchema(data.amount, 1),
  });
}
