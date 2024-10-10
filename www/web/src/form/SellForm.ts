import { BN } from "bn.js";
import { safeBN, unsafeBN } from "@hashfund/bn";
import { Program, web3 } from "@coral-xyz/anchor";

import { swap, TradeDirection, Zeroboost } from "@hashfund/zeroboost";


export async function processSellForm(
  program: Program<Zeroboost>,
  mint: web3.PublicKey,
  amount: number,
  decimals: number
) {
  const payer = program.provider.publicKey!;
  const safeAmount = unsafeBN(
    safeBN(amount, decimals).mul(new BN(Math.pow(10, decimals))),
    decimals
  );

  return await (
    await swap(program, mint, payer, {
      amount: safeAmount,
      tradeDirection: TradeDirection.AtoB,
    })
  ).rpc();
}
