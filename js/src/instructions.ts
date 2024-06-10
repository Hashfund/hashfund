import BN from "bn.js";
import {
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  SYSVAR_INSTRUCTIONS_PUBKEY,
  SYSVAR_RENT_PUBKEY,
  TransactionInstruction,
} from "@solana/web3.js";
import { MPL_TOKEN_METADATA_PROGRAM_ID } from "@metaplex-foundation/mpl-token-metadata";

import { PROGRAM_ID } from "./config";
import { findMetadataPda, findMasterEditionPda } from "./utils";
import { InitializeMintTokenSchema, MintTokenSchema } from "./state";

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
        { pubkey: payer, isSigner: true, isWritable: false },
        { pubkey: mint, isSigner: false, isWritable: true },
        { pubkey: mintAuthority, isSigner: false, isWritable: true },
        {
          pubkey: new PublicKey(metadataProgram),
          isSigner: false,
          isWritable: true,
        },
        { pubkey: metadataPda, isSigner: false, isWritable: true },
        { pubkey: masterEditionPda, isSigner: false, isWritable: true },
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

export function mintTokenInstruction({
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

type CreateMintInstructionArgs = {
  name: string;
  ticker: string;
  uri: string;
  decimals: number;
  totalSupply: BN;
};

export async function createMintInstruction(
  { name, ticker, uri, decimals, totalSupply }: CreateMintInstructionArgs,
  payer: Keypair
) {
  let [mint, initializeInstruction] = initializeMintTokenInstruction({
    payer: payer.publicKey,
    data: new InitializeMintTokenSchema(name, ticker, uri, decimals),
  });

  let data = new MintTokenSchema(
    totalSupply.mul(new BN(10).pow(new BN(decimals)))
  );

  let mintReserveAta = await getAssociatedTokenAddress(mint, PROGRAM_ID, true);

  let createMintReserveAtaInstruction = createAssociatedTokenAccountInstruction(
    payer.publicKey,
    mintReserveAta,
    PROGRAM_ID,
    mint
  );

  let mintInstruction = mintTokenInstruction({
    data,
    mint,
    mintReserveAta,
    payer: payer.publicKey,
  });

  return [
    mint,
    [initializeInstruction, createMintReserveAtaInstruction, mintInstruction],
  ] as const;
}
