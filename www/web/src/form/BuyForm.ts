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

  const instruction = await swap(program, mint, payer, {
    amount: safeAmount,
    tradeDirection: TradeDirection.BtoA,
  });

  const connection = program.provider.connection;

  const getTx = async () => {
    const { blockhash, lastValidBlockHeight } =
      await connection.getLatestBlockhash("confirmed");
    const tx = await instruction.transaction();
    tx.recentBlockhash = blockhash;
    tx.feePayer = payer;
    return { tx, blockhash, lastValidBlockHeight };
  };

  try {
    const { tx, blockhash, lastValidBlockHeight } = await getTx();
    const signedTx = await (
      program.provider as any
    ).wallet.signTransaction(tx);

    const signature = await connection.sendRawTransaction(
      signedTx.serialize(),
      {
        skipPreflight: false,
        preflightCommitment: "confirmed",
      }
    );

    await connection.confirmTransaction(
      {
        signature,
        blockhash,
        lastValidBlockHeight,
      },
      "confirmed"
    );

    return signature;
  } catch (err: any) {
    console.error(
      "Buy transaction failed, attempting retry with fresh blockhash...",
      err
    );

    const { tx, blockhash, lastValidBlockHeight } = await getTx();
    const signedTx = await (
      program.provider as any
    ).wallet.signTransaction(tx);
    const signature = await connection.sendRawTransaction(
      signedTx.serialize(),
      {
        skipPreflight: false,
        preflightCommitment: "confirmed",
      }
    );

    await connection.confirmTransaction(
      {
        signature,
        blockhash,
        lastValidBlockHeight,
      },
      "confirmed"
    );

    return signature;
  }
}
