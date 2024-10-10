import { NATIVE_MINT } from "@solana/spl-token";
import { safeBN, unsafeBN } from "@hashfund/bn";
import { type Program, BN, web3 } from "@coral-xyz/anchor";
import {
  TradeDirection,
  type Zeroboost,
  devnet,
  getMintPda,
  mintToken,
  rawSwap,
} from "@hashfund/zeroboost";

import { object, number } from "yup";

import type { MetadataForm } from "./MetadataForm";

export const validateMintSupplySchema = object().shape({
  supply: number().min(1),
  liquidityPercentage: number().min(0).required(),
});

export const createInitialBuySchema = (balance: number) =>
  object().shape({
    amount: number()
      .max(balance, "Insufficient Balance")
      .min(0, "At least decimal greater then 0"),
  });

export type MintSupplyForm = {
  supply: number;
  liquidityPercentage: number;
};

export type MintInitialBuyForm = {
  pairAmount: number;
  tokenAmount: number;
};

export const processMintForm = async function (
  program: Program<Zeroboost>,
  {
    name,
    symbol,
    uri,
    decimals,
  }: Pick<MetadataForm, "name" | "symbol"> & {
    uri: string;
    decimals: number;
  },
  { supply, liquidityPercentage }: MintSupplyForm,
  initialBuyForm?: MintInitialBuyForm
) {
  const payer = program.provider.publicKey!;
  const [mint] = getMintPda(name, symbol, payer, program.programId);
  const instructions = [];

  const mintInstructions = await mintToken(
    program,
    NATIVE_MINT,
    payer,
    {
      uri,
      name,
      symbol,
      decimals,
      liquidityPercentage,
      supply: unsafeBN(
        safeBN(supply, decimals).mul(new BN(decimals)),
        decimals
      ),
      migrationTarget: {
        raydium: {},
      },
    },
    devnet.PYTH_SOL_USD_FEED
  ).instruction();

  instructions.push(mintInstructions);

  if (initialBuyForm && initialBuyForm.pairAmount > 0) {
    const { pairAmount } = initialBuyForm;
    const buyInstructions = await (
      await rawSwap(program, mint, NATIVE_MINT, payer, {
        amount: unsafeBN(safeBN(pairAmount).mul(new BN(Math.pow(10, 9)))),
        tradeDirection: TradeDirection.BtoA,
      })
    ).instruction();

    instructions.push(buyInstructions);
  }
  
  const recentBlockhash = (await program.provider.connection.getLatestBlockhash()).blockhash;
  
  const message = new web3.TransactionMessage({
    payerKey: payer,
    instructions,
    recentBlockhash,
  }).compileToV0Message()

  const signature = await program.provider.sendAndConfirm!(
    new web3.VersionedTransaction(message)
  );

  return [mint, signature] as const;
};
