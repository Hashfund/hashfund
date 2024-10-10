import { sleep } from "./utils";

export const catchAndRetryRuntimeError = <T>(
  fn: (data: T, slot: number, signature: string) => Promise<any>
) => {
  let noRetries = 0;

  const proxy = async (data: T, slot: number, signature: string) => {
    if (noRetries >= 5) return console.log("Maximum retry depth reached.");
    try {
      noRetries += 1;
      return await fn(data, slot, signature);
    } catch (error) {
      console.error("error=", error);
      await sleep(60000);
      return await proxy(data, slot, signature);
    }
  };

  return proxy;
};
