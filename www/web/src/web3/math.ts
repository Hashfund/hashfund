import { BN } from "@coral-xyz/anchor";
import { safeBN, unsafeBN } from "@hashfund/bn";
import type { Price, PriceFeed } from "@pythnetwork/price-service-client";

export const priceToNumber = (price: Price) =>
  Number(price.price) * Math.pow(10, price.expo);

export const percentageBN = (
  a: string | number | bigint,
  b: string | number | bigint
) =>
  unsafeBN(
    safeBN(b)
      .div(new BN(String(a)))
      .mul(new BN(100))
  );

export const mapFeed = (priceFeed: PriceFeed) => {
  const id = "0x" + priceFeed.id;
  const amount = priceToNumber(priceFeed.getEmaPriceUnchecked());

  return [id, amount] as const;
};
