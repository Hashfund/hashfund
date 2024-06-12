import BN from "bn.js";
import {
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddress,
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

import { PROGRAM_ID } from "./config";
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

type InitializeMintTokenInstructionArgs = {
  programId?: PublicKey;
  sysvarRent?: PublicKey;
  sysVarInstructions?: PublicKey;
  systemProgram?: PublicKey;
  tokenProgram?: PublicKey;
  metadataProgram?: string;
  payer: PublicKey;
  data: InitializeMintTokenSchema;
};

function initializeMintTokenInstruction({
  programId = PROGRAM_ID,
  sysvarRent = SYSVAR_RENT_PUBKEY,
  sysVarInstructions = SYSVAR_INSTRUCTIONS_PUBKEY,
  systemProgram = SystemProgram.programId,
  tokenProgram = TOKEN_PROGRAM_ID,
  metadataProgram = MPL_TOKEN_METADATA_PROGRAM_ID,
  payer,
  data,
}: InitializeMintTokenInstructionArgs) {
  const [mintAuthority] = PublicKey.findProgramAddressSync(
    [Buffer.from("mint_authority"), payer.toBuffer()],
    programId
  );

  const [mint] = PublicKey.findProgramAddressSync(
    [
      Buffer.from(data.name),
      Buffer.from(data.ticker),
      Buffer.from(data.uri),
      payer.toBuffer(),
    ],
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
  programId?: PublicKey;
  tokenProgram?: PublicKey;
  mint: PublicKey;
  mintReserveAta: PublicKey;
  payer: PublicKey;
  data: MintTokenSchema;
};

function mintTokenInstruction({
  programId = PROGRAM_ID,
  tokenProgram = TOKEN_PROGRAM_ID,
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
  programId?: PublicKey;
  systemProgram?: PublicKey;
  tokenAMint: PublicKey;
  tokenBMint: PublicKey;
  boundingCurve: PublicKey;
  payer: PublicKey;
  data: InitializeCurveSchema;
};

function initializeCurveInstruction({
  programId = PROGRAM_ID,
  systemProgram = SystemProgram.programId,
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
  programId?: PublicKey;
  systemProgram?: PublicKey;
  tokenProgram?: PublicKey;
  tokenAMint: PublicKey;
  tokenBMint?: PublicKey;
  boundingCurve: PublicKey;
  tokenASource: PublicKey;
  tokenADestination: PublicKey;
  tokenBSource: PublicKey;
  tokenBDestination: PublicKey;
  payer: PublicKey;
  data: SwapSchema;
};

function swapInstruction({
  programId = PROGRAM_ID,
  systemProgram = SystemProgram.programId,
  tokenProgram = TOKEN_PROGRAM_ID,
  tokenAMint,
  tokenBMint = NATIVE_MINT,
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
  name: string;
  ticker: string;
  uri: string;
  decimals: number;
  totalSupply: BN;
  payer: PublicKey;
};

export async function createMintInstruction({
  name,
  ticker,
  uri,
  decimals,
  totalSupply,
  payer,
}: CreateMintInstructionArgs) {
  let [mint, initializeInstruction] = initializeMintTokenInstruction({
    payer,
    data: new InitializeMintTokenSchema(name, ticker, uri, decimals),
  });

  let data = new MintTokenSchema(
    totalSupply.mul(new BN(10).pow(new BN(decimals)))
  );

  let [boundingCurve] = findBoundingCurvePda(mint, PROGRAM_ID);

  let mintReserveAta = await getAssociatedTokenAddress(
    mint,
    boundingCurve,
    true
  );

  let createMintReserveAtaInstruction = createAssociatedTokenAccountInstruction(
    payer,
    mintReserveAta,
    boundingCurve,
    mint
  );

  let mintInstruction = mintTokenInstruction({
    data,
    payer,
    mint,
    mintReserveAta,
  });

  return [
    mint,
    [initializeInstruction, createMintReserveAtaInstruction, mintInstruction],
  ] as const;
}

type CreateInitializeCurveArgs = {
  connection: Connection;
  tokenAMint: PublicKey;
  tokenBMint: PublicKey;
  payer: PublicKey;
  data: InitializeCurveSchema;
};

export async function createInitializeCurveInstruction({
  connection,
  tokenAMint,
  tokenBMint,
  payer,
  data,
}: CreateInitializeCurveArgs) {
  const [boundingCurve] = findBoundingCurvePda(tokenAMint, PROGRAM_ID);

  const boundingCurveTokenAAccountIx =
    await getOrCreateAssociatedTokenAccountInstructions(
      connection,
      tokenAMint,
      payer,
      boundingCurve,
      true
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

  // console.log("payer=", payer.toBase58());
  // console.log("tokenA=", tokenAMint.toBase58());
  // console.log("tokenB=", tokenBMint.toBase58());
  // console.log("boundingCurve=", boundingCurve.toBase58());
  // console.log(
  //   "boundingCurveTokenAAccount",
  //   boundingCurveTokenAAccount.toBase58()
  // );
  // console.log(
  //   "boundingCurveTokenBAccount=",
  //   boundingCurveTokenBAccount.toBase58()
  // );
  // console.log("payerTokenAAccount=", payerTokenAAccount.toBase58());
  // console.log("payerTokenBAccount=", payerTokenBAccount.toBase58());

  const initializeCurveIx = initializeCurveInstruction({
    boundingCurve,
    tokenAMint,
    tokenBMint,
    payer,
    data,
  });

  return [
    ...boundingCurveTokenAAccountIx,
    ...boundingCurveTokenBAccountIx,
    ...payerTokenAAccountIx,
    ...payerTokenBAccountIx,
    initializeCurveIx,
  ];
}

type CreateSwapArgs = {
  tokenAMint: PublicKey;
  tokenBMint: PublicKey;
  payer: PublicKey;
  data: SwapSchema;
};

export function createSwapInInstruction({
  tokenAMint,
  tokenBMint,
  payer,
  data,
}: CreateSwapArgs) {
  const [boundingCurve] = findBoundingCurvePda(tokenAMint, PROGRAM_ID);
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
    tokenAMint,
    tokenBMint,
    boundingCurve,
    tokenASource,
    tokenADestination,
    tokenBSource,
    tokenBDestination,
    payer,
    data,
  });
}

export function createSwapOutInstruction({
  tokenAMint,
  tokenBMint,
  payer,
  data,
}: CreateSwapArgs) {
  const [boundingCurve] = findBoundingCurvePda(tokenAMint, PROGRAM_ID);

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
    tokenAMint,
    data,
    boundingCurve,
    tokenASource,
    tokenADestination,
    tokenBSource,
    tokenBDestination,
    payer,
  });
}
