import BN from "bn.js";
import {
  createInitializeCurveInstruction,
  createMintInstruction,
  createSwapInInstruction,
  SOL_USD_FEED,
} from "@hashfund/program";
import { Connection, PublicKey, Transaction } from "@solana/web3.js";

type CreateMintTokenTransactionArgs = {
  name: string;
  ticker: string;
  uri: string;
  maximumMarketCap: BN;
  initialBuyAmount?: BN;
  supplyFraction: BN;
  totalSupply: BN;
  connection: Connection;
  payer: PublicKey;
};

export const createMintTokenTransaction = async function ({
  name,
  ticker,
  uri,
  maximumMarketCap,
  initialBuyAmount,
  supplyFraction,
  totalSupply,
  payer,
  connection,
}: CreateMintTokenTransactionArgs) {
  let [tokenAMint, createMintInstructionIx] = createMintInstruction({
    payer,
    data: {
      name,
      ticker,
      uri,
      totalSupply,
    },
  });

  const ix0 = [
    ...createMintInstructionIx,
    ...(await createInitializeCurveInstruction({
      connection,
      tokenAMint,
      payer,
      solUsdFeed: SOL_USD_FEED,
      data: {
        supplyFraction,
        maximumMarketCap,
      },
    })),
  ];

  const transaction = new Transaction().add(...ix0);

  if (initialBuyAmount) {
    const ix1 = createSwapInInstruction({
      connection,
      payer,
      tokenAMint,
      data: {
        amount: initialBuyAmount,
      },
    });

    transaction.add(ix1);
  }

  return [tokenAMint, transaction] as const;
};
