import Api from "@hashfund/sdk";
import type { Program } from "@coral-xyz/anchor";
import { getMintPda, type Zeroboost } from "@hashfund/zeroboost";

import { type InferType, mixed, object, string } from "yup";

import { createTokenRichMetadata } from "@/web3/asset";

export const validateMetadataSchema = object().shape({
  website: string().url(),
  telegram: string().url(),
  twitter: string().url(),
  name: string().max(16).required(),
  symbol: string().max(10).required(),
  description: string().required().min(32),
  image: mixed().required("Image is required"),
});

export type MetadataForm = InferType<typeof validateMetadataSchema> & {
  decimals: number;
  uri: string;
  image: File | undefined;
};

export function processMetadataForm(
  program: Program<Zeroboost>,
  api: Api,
  form: MetadataForm
) {
  const creator = program.provider.publicKey;
  if (creator) {
    const [nonce] = getMintPda(form.name, form.symbol, creator);
    return createTokenRichMetadata(api, form, nonce.toBase58());
  }

  throw new Error("Creator not provider. Make sure wallet is connected.");
}
