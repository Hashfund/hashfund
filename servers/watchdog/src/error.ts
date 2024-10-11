import { sleep } from "./utils";

export const catchAndRetryRuntimeError =
  <T>(fn: (data: T, slot: number, signature: string) => Promise<any>) =>
  async (data: T, slot: number, signature: string) =>
    await fn(data, slot, signature);
