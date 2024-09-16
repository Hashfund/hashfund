import BN from "bn.js";

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
