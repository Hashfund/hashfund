import BN from "bn.js";
import { sha256 } from "@noble/hashes/sha256";
import { Connection, PublicKey, Keypair } from "@solana/web3.js";
import {
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { MPL_TOKEN_METADATA_PROGRAM_ID } from "@metaplex-foundation/mpl-token-metadata";

import { EventSchema, type Event } from "./event";

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

export function findMintAuthorityPda(
  owner: PublicKey,
  mint: PublicKey,
  programId: PublicKey
) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("mint_authority"), owner.toBuffer(), mint.toBuffer()],
    programId
  );
}

export function findBoundingCurvePda(mint: PublicKey, programId: PublicKey) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("hashfund"), mint.toBuffer()],
    programId
  );
}

export function findBoundingCurveReservePda(
  boundingCurve: PublicKey,
  programId: PublicKey
) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("hashfund"), boundingCurve.toBuffer()],
    programId
  );
}

export async function getOrCreateAssociatedTokenAccountInstructions(
  connection: Connection,
  mint: PublicKey,
  payer: PublicKey,
  owner: PublicKey,
  allowOwnerOffCurve?: boolean,
  programId?: PublicKey,
  associatedTokenProgramId?: PublicKey
) {
  const tokenAccount = getAssociatedTokenAddressSync(
    mint,
    owner,
    allowOwnerOffCurve
  );

  const account = await connection.getAccountInfo(tokenAccount);
  if (account) return [];

  return [
    createAssociatedTokenAccountInstruction(
      payer,
      tokenAccount,
      owner,
      mint,
      programId,
      associatedTokenProgramId
    ),
  ];
}

function generateVaultSignerPda(
  nonce: BN,
  market: PublicKey,
  programId: PublicKey
) {
  return PublicKey.createProgramAddressSync(
    [market.toBuffer(), nonce.toArrayLike(Buffer, "le", 8)],
    programId
  );
}

export function findVaultSignerPda(market: PublicKey, programId: PublicKey) {
  let nonce = new BN(0);

  while (true) {
    try {
      return [generateVaultSignerPda(nonce, market, programId), nonce] as const;
    } catch {
      nonce.iaddn(1);
    }
  }
}

function createWithSeed(
  fromPublicKey: PublicKey,
  seed: string,
  programId: PublicKey
) {
  const buffer = Buffer.concat([
    fromPublicKey.toBuffer(),
    Buffer.from(seed),
    programId.toBuffer(),
  ]);
  const publicKeyBytes = sha256(buffer);
  return new PublicKey(publicKeyBytes);
}

export type PublicKeyWithSeed = {
  seed: string;
  publicKey: PublicKey;
};

export function generatePublicKey({
  fromPublicKey,
  programId = TOKEN_PROGRAM_ID,
}: {
  fromPublicKey: PublicKey;
  programId: PublicKey;
}): PublicKeyWithSeed {
  const seed = Keypair.generate().publicKey.toBase58().slice(0, 32);
  const publicKey = createWithSeed(fromPublicKey, seed, programId);
  return { publicKey, seed };
}

export function parseLogs(logs: string[]) {
  const regex = /emit!/g;
  let events: Event[] = [];
  const batchMint: Pick<Event, "Mint" | "MintTo"> = {};

  for (const log of logs) {
    if (log.search(regex) > 0) {
      try {
        const event = EventSchema.deserialize<Event>(
          Buffer.from(log.split(regex)[1], "base64")
        );

        if (event?.Mint) {
          batchMint.Mint = event.Mint;
          continue;
        }
        if (event?.MintTo) {
          batchMint.MintTo = event.MintTo;
          continue;
        }

        if (event) events.push(event);
      } catch {}
    }
  }

  return [batchMint, ...events] as const;
}
