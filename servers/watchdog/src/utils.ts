import xior from "xior";
import { BN, web3 } from "@coral-xyz/anchor";

type Safe<T> = {
  [key in keyof T]: T[key] extends boolean
    ? T[key]
    : T[key] extends BN
    ? bigint
    : string;
};

export const safeParse = <T extends Readonly<object>>(input: T): Safe<T> => {
  const proxy = (input: T): any => {
    if (Array.isArray(input)) return input.map(safeParse);
    if (typeof input === "object" && input.constructor === Object) {
      const result: Record<string, any> = {};

      for (const [key, value] of Object.entries(input)) {
        if (value instanceof BN) result[key] = BigInt(value.toString());
        else if (value instanceof web3.PublicKey)
          result[key] = value.toBase58();
        else result[key] = proxy(value);
      }

      return result;
    }

    return input;
  };

  return proxy(input);
};

export const omit = <T extends object, TKey extends keyof T>(
  value: T,
  ...keys: TKey[]
) => {
  for (const key of keys) {
    delete value[key];
  }

  return value as Omit<T, TKey>;
};

export const safeFetch = (uri: string) =>
  xior
    .get(uri)
    .then(({ data }) => data)
    .catch(() => null);

export const sleep = (duration: number) =>
  new Promise<number>((resolve) => setTimeout(() => resolve(0), duration));
