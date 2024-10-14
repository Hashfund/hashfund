import { BN } from "@coral-xyz/anchor";
import { safeBN, unsafeBN, unsafeBnToNumber } from "@hashfund/bn";

export const normalizeBN = (
  input: string | number | bigint | BN,
  decimals: number
) => {
  const bn = unsafeBN(
    safeBN(input, decimals).div(new BN(10).pow(new BN(decimals))),
    decimals
  );
  return bn.toNumber();
};

export const denormalizeBN = (
  value: string | number | bigint | BN,
  decimals: number
) =>
  unsafeBN(
    safeBN(Number(value), decimals).mul(new BN(10).pow(new BN(decimals))),
    decimals
  );
