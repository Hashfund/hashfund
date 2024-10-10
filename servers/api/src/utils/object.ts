import BN from "bn.js";
import { web3 } from "@coral-xyz/anchor";

export function sumBN<
  T extends Array<any>,
  Fn extends (value: T[number]) => BN
>(self: T, mapFn: Fn, start: BN) {
  let result = start;
  for (const item of self) {
    const value = mapFn(item);
    result = result.add(value);
  }

  return result;
}

export const safeStringify = <T extends Readonly<object>>(input: T) => {
  return JSON.parse(
    JSON.stringify(input, (key, value) => {
      if (value instanceof BN || typeof value === "bigint")
        return value.toString();
      else if (value instanceof web3.PublicKey) return value.toBase58();
      return value;
    })
  );
};
