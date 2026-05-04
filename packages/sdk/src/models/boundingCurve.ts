import type BN from "bn.js";
import type { web3 } from "@coral-xyz/anchor";

export type BoundingCurve = {
  id: string;
  mint: string;
  migrated: boolean;
  tradeable: boolean;
  initialPrice: number;
  initialSupply: string;
  liquidityPercentage: string;
  minimumPairBalance: string;
  maximumPairBalance: string;
  virtualTokenBalance: string;
  virtualPairBalance: string;
  netActiveCapital: string;
  totalContributed: string;
  totalBurnedTokens: string;
  totalFeesCollected: string;
  createdAt: string;
  updatedAt: string;
};

export type RefinedBoundingCurve = {
  id: web3.PublicKey;
  mint: web3.PublicKey;
  initialPrice: number;
  initialSupply: BN;
  liquidityPercentage: number;
  minimumPairBalance: BN;
  maximumPairBalance: BN;
  virtualTokenBalance: BN;
  virtualPairBalance: BN;
  netActiveCapital: BN;
  totalContributed: BN;
  totalBurnedTokens: BN;
  totalFeesCollected: BN;
  createdAt: Date;
  updatedAt: Date;
} & Pick<BoundingCurve, "migrated" | "tradeable">;
