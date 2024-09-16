import { BN } from "bn.js";
import { safeBN, unsafeBN } from "@solocker/safe-bn";

import { Connection, PublicKey } from "@solana/web3.js";
import { WalletContextState } from "@solana/wallet-adapter-react";

import { number, object } from "yup";

import { createSwapInTransaction } from "@/web3/trade";

export const createValidationSchema = (balance: number) =>
  object().shape({
    buyAmount: number()
      .max(balance, "Insufficient Balance")
      .min(0, "At least decimal greater then 0"),
  });

export async function processBuyForm(
  wallet: WalletContextState,
  connection: Connection,
  mint: string,
  amount: string,
  decimals = 9
) {
  const safeAmount = unsafeBN(
    safeBN(Number.parseFloat(amount), decimals).mul(
      new BN(10).pow(new BN(decimals))
    ),
    decimals
  );

  return wallet.sendTransaction(
    await createSwapInTransaction(
      connection,
      wallet.publicKey!,
      new PublicKey(mint),
      safeAmount
    ),
    connection
  );
}
