import { Price } from "@pythnetwork/price-service-client";
import { normalizeBN } from "./decimal";
import { safeBN } from "@solocker/safe-bn";

export const calculateBNPercentile = (a: string, b: string) => {
  const value = normalizeBN(a) - normalizeBN(b);

  return Number.isNaN(value) ? 0 : value;
};

export const calculateBNPercentage = (
  a: string | number,
  b: string | number
) => {
  const value = (Math.max(normalizeBN(a), 0) / normalizeBN(b)) * 100;

  return Number.isNaN(value) ? 0 : value;
};

export const calculateMarketcapWeight = (
  marketCap: string,
  maximumMarketCap: string
) => {
  const value = normalizeBN(marketCap) / normalizeBN(maximumMarketCap);
  return Number.isNaN(value) ? 0 : value;
};

export const priceToNumber = (price: Price) =>
  Number(price.price) * Math.pow(10, price.expo);

export const toUiAmount = (
  value: number,
  tokenADecimal: number = 6,
  tokenBDecimal: number = 9
) =>  Number(value) / Math.pow(10, tokenBDecimal - tokenADecimal);
