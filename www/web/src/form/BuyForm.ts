import { BN } from "bn.js";
import { number, object } from "yup";
import { safeBN, unsafeBN } from "@hashfund/bn";
import { type Program, web3 } from "@coral-xyz/anchor";

import { swap, TradeDirection, Zeroboost } from "@hashfund/zeroboost";


export const createValidationSchema = (balance: number) =>
  object().shape({
    buyAmount: number()
      .max(balance, "Insufficient Balance")
      .min(0, "At least decimal greater then 0"),
  });

export async function processBuyForm(
  program: Program<Zeroboost>,
  mint: web3.PublicKey,
  amount: number
) {
  const payer = program.provider.publicKey!;
  const safeAmount = unsafeBN(safeBN(amount).mul(new BN(Math.pow(10, 9))));

  return await (
    await swap(program, mint, payer, {
      amount: safeAmount,
      tradeDirection: TradeDirection.BtoA,
    })
  ).rpc();
}
