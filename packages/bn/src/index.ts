import BN from "bn.js";

/**
 * Safely convert any value to a BN with specified decimals.
 * Standardizes on BigInt conversion to avoid precision loss from numbers.
 */
export const safeBN = function (
  value: BN | number | string | bigint,
  decimals: number = 9 // Default to 9 (e.g. SOL)
) {
  let input: bigint;

  if (value instanceof BN) {
    return value;
  }

  const multiplier = BigInt(10 ** decimals);

  switch (typeof value) {
    case "bigint":
      input = value; // Assumed to be already scaled or raw? 
      // Wait, usually if it's bigint it's already a raw value.
      return new BN(value.toString());
    case "number":
      // Be careful with float precision
      input = BigInt(Math.round(value * Number(multiplier)));
      break;
    case "string":
      if (value.includes(".")) {
        const [int, frac] = value.split(".");
        const fracPad = frac.padEnd(decimals, "0").slice(0, decimals);
        input = BigInt(int) * multiplier + BigInt(fracPad);
      } else {
        input = BigInt(value) * multiplier;
      }
      break;
    default:
      // Fallback for other objects
      return new BN((value as any).toString());
  }

  return new BN(input.toString());
};

/**
 * Divides a BN by 10^decimals, returning a new BN.
 */
export const unsafeBN = function (value: BN, decimals: number = 9) {
  return value.div(new BN(10).pow(new BN(decimals)));
};

/**
 * Safely converts a large BN to a number for display.
 * Avoids .toNumber() which throws if > 53 bits.
 */
export const unsafeBnToNumber = function (value: BN, decimals: number = 9) {
  const s = value.toString();
  if (s.length <= decimals) {
    return parseFloat("0." + s.padStart(decimals, "0"));
  }
  const intPart = s.slice(0, s.length - decimals);
  const fracPart = s.slice(s.length - decimals);
  return parseFloat(intPart + "." + fracPart);
};
