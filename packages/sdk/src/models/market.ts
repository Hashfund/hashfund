import type { BN } from "@coral-xyz/anchor";

export type Market = {
  pairVolume: string;
  tokenVolume: string;
  sellVolume: string;
  buyVolume: string;
  txnCount: number;
};

export type RefinedMarket = {
  pairVolume: BN;
  tokenVolume: BN;
  sellVolume: BN;
  buyVolume: BN;
  txnCount: number;
};
