import BN from "bn.js";

import { Connection } from "@solana/web3.js";
import { safeBN, unsafeBN } from "@hashfund/bn";
import { WalletContextState } from "@solana/wallet-adapter-react";

import { mixed, object, string, InferType, number } from "yup";

import { findMintAddress } from "@/web3/address";
import { createTokenRichMetadata } from "@/web3/asset";
import { createMintTokenTransaction } from "@/web3/mint";

export const validateMetadataSchema = object().shape({
  name: string().max(16).required(),
  symbol: string().max(10).required(),
  description: string().required().min(32),
  website: string().url(),
  telegram: string().url(),
  twitter: string().url(),
  image: mixed().required("Image is required"),
});

export const validateMaximumMarketCapSchema = object().shape({
  maximumMarketCap: number()
    .min(0, "Invalid amount")
    .lessThan(10 * Math.pow(10, 9))
    .required(),
  liquidityPercentage: number().min(0).required(),
  totalSupply: number().min(1),
});

export const createInitialDepositSchema = (balance: number) =>
  object().shape({
    amount: number()
      .max(balance, "Insufficient Balance")
      .min(0, "At least decimal greater then 0"),
  });

export type MintMetadataForm = InferType<typeof validateMetadataSchema> & {
  image: File;
};

export type MintMaximumMarketCapForm = {
  maximumMarketCap: number;
  maximumMarketCapPc: number;
  totalSupply: number;
  liquidityPercentage: number;
};

export type MintInitialBuyAmountForm = {
  initialBuyAmount: number;
  initialBuyAmountPc: number;
};

export const processForm = async function (
  connection: Connection,
  { publicKey, sendTransaction }: WalletContextState,
  {
    name,
    symbol,
    image,
    description,
    website,
    telegram,
    twitter,
  }: MintMetadataForm,
  {
    maximumMarketCap,
    totalSupply,
    liquidityPercentage,
  }: MintMaximumMarketCapForm,
  { initialBuyAmount }: MintInitialBuyAmountForm
) {
  const mint = findMintAddress(name, symbol, publicKey!);

  let uri = await createTokenRichMetadata(
    {
      name,
      description,
      website,
      telegram,
      twitter,
      image,
      symbol,
    },
    mint.toBase58()
  );

  const [tokenMint, transaction] = await createMintTokenTransaction({
    name,
    ticker: symbol,
    uri,
    totalSupply: new BN(totalSupply).mul(new BN(10).pow(new BN(6))),
    maximumMarketCap: unsafeBN(
      safeBN(maximumMarketCap).mul(new BN(10).pow(new BN(9)))
    ),
    initialBuyAmount: unsafeBN(
      safeBN(initialBuyAmount).mul(new BN(10).pow(new BN(9)))
    ),
    supplyFraction: new BN(100 - liquidityPercentage),
    payer: publicKey!,
    connection,
  });

  return [tokenMint.toBase58(), await sendTransaction(transaction, connection)];
};
