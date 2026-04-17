import { BN } from "@coral-xyz/anchor";
import { safeBN, unsafeBN, unsafeBnToNumber } from "@hashfund/bn";

export const normalizeBN = (
  input: string | number | bigint | BN,
  decimals: number
) => {
  const raw = input instanceof BN ? input : new BN(input.toString());
  // Divide by 10^decimals and convert to number safely for display
  return unsafeBnToNumber(raw, decimals);
};

export const denormalizeBN = (
  value: string | number | bigint | BN,
  decimals: number
) =>
  unsafeBN(
    safeBN(Number(value), decimals).mul(new BN(10).pow(new BN(decimals))),
    decimals
  );
