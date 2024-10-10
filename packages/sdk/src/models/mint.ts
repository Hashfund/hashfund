import type { BN, web3 } from "@coral-xyz/anchor";

import type { Metadata } from "./metadata";
import type { Market, RefinedMarket } from "./market";
import type { BoundingCurve, RefinedBoundingCurve } from "./boundingCurve";

export type Mint = {
  id: string;
  uri: string;
  name: string;
  symbol: string;
  supply: string;
  decimals: number;
  creator: string;
  signature: string;
  timestamp: string;
  metadata: Metadata;
};

export type RefinedMint = {
  id: web3.PublicKey;
  supply: BN;
  decimals: number;
  creator: web3.PublicKey;
  timestamp: Date;
} & Pick<Mint, "name" | "uri" | "symbol" | "signature" | "metadata">;

export type MintWithExtra = Mint & {
  market: Market;
  boundingCurve: BoundingCurve;
};

export type RefinedMintExtra = RefinedMint & {
  market: RefinedMarket;
  boundingCurve: RefinedBoundingCurve;
};
