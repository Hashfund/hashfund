import { Program } from "@coral-xyz/anchor";
import { Zeroboost } from "@hashfund/zeroboost";

export const catchAndRetryRuntimeError =
  <T>(
    fn: (
      program: Program<Zeroboost>,
      data: T,
      signature: string
    ) => Promise<any>
  ) =>
  async (program: Program<Zeroboost>, data: T, signature: string) =>
    await fn(program, data, signature);
