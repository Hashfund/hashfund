import { BN, web3 } from "@coral-xyz/anchor";

export type BoundingCurve = {
  id: string;
  mint: string;
  migrated: boolean;
  tradeable: boolean;
  initialPrice: number;
  liquidityPercentage: string;
  minimumPairBalance: string;
  maximumPairBalance: string;
  virtualTokenBalance: string;
  virtualPairBalance: string;
  createdAt: string;
  updatedAt: string;
};

export type RefinedBoundingCurve = {
  id: web3.PublicKey;
  mint: web3.PublicKey;
  initialPrice: number;
  liquidityPercentage: number;
  minimumPairBalance: BN;
  maximumPairBalance: BN;
  virtualTokenBalance: BN;
  virtualPairBalance: BN;
  createdAt: Date;
  updatedAt: Date;
} & Pick<BoundingCurve, "migrated" | "tradeable">;
