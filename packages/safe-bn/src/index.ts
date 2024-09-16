import BN from "bn.js";

export const safeBN = function (
  value: BN | number | string,
  decimals: number = 3
) {
  let input: string | BN;

  switch (typeof value) {
    case "number":
      input = new BN(
        Number(
          Number(value.toFixed(decimals)) * Math.pow(10, decimals)
        ).toString(16),
        "hex"
      );
      break;
    case "string":
      input = new BN(value, "hex").mul(new BN(10).pow(new BN(decimals)));
      break;
    default:
      input = value.mul(new BN(10).pow(new BN(decimals)));
  }

  return new BN(input);
};

export const unsafeBN = function (value: BN, decimals: number = 3) {
  return value.div(new BN(10).pow(new BN(decimals)));
};

export const unsafeBnToNumber = function (value: BN, decimals: number = 3) {
  return value.toNumber() / Math.pow(10, decimals);
};
