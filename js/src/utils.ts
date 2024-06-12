import { readFileSync } from "fs";
import { Keypair, PublicKey } from "@solana/web3.js";
import { MPL_TOKEN_METADATA_PROGRAM_ID } from "@metaplex-foundation/mpl-token-metadata";

export function loadWallet(path: string): any {
  return Keypair.fromSecretKey(
    new Uint8Array(JSON.parse(readFileSync(path, "utf-8")))
  );
}

export function findMetadataPda(
  mint: PublicKey,
  programId: string = MPL_TOKEN_METADATA_PROGRAM_ID
) {
  const _programId = new PublicKey(programId);
  return PublicKey.findProgramAddressSync(
    [Buffer.from("metadata"), _programId.toBuffer(), mint.toBuffer()],
    _programId
  );
}

export function findMasterEditionPda(
  mint: PublicKey,
  programId: string = MPL_TOKEN_METADATA_PROGRAM_ID
) {
  const _programId = new PublicKey(programId);

  return PublicKey.findProgramAddressSync(
    [
      Buffer.from("metadata"),
      _programId.toBuffer(),
      mint.toBuffer(),
      Buffer.from("edition"),
    ],
    _programId
  );
}

export function findBoundingCurvePda(mint: PublicKey, programId: PublicKey) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("hashfund"), mint.toBuffer()],
    programId
  );
}
