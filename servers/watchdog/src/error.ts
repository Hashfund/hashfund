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

export class MultipleError {
  readonly errors: any[];

  constructor(...errors: any[]) {
    this.errors = errors;
  }

  log() {
    for (const error of this.errors) {
      console.error(error);
    }
  }
}
