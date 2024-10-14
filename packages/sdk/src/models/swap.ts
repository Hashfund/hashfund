import { BN, web3 } from "@coral-xyz/anchor";

import type { User } from "./user";
import { TradeDirection } from "@hashfund/zeroboost";

export type Swap = {
  id: string;
  tokenAmount: string;
  pairAmount: string;
  marketCap: string;
  virtualTokenBalance: string;
  virtualPairBalance: string;
  tradeDirection: TradeDirection;
  mint: string;
  payer: User;
  signature: string;
  timestamp: string;
};

export type RefinedSwap = {
  mint: web3.PublicKey;
  payer: web3.PublicKey;
  tokenAmount: BN;
  pairAmount: BN;
  marketCap: BN;
  virtualTokenBalance: BN;
  virtualPairBalance: BN;
  timestamp: Date;
} & Pick<Swap, "id" | "tradeDirection" | "signature">;

export type SwapWithVolume = {
  pairVolume: string;
  tokenVolume: string;
  tradeDirection: TradeDirection;
};

export type SwapWithGraph = {
  open: string;
  close: string;
  low: string;
  high: string;
  time: string;
};

export type RefinedSwapWithGraph = {
  open: BN;
  close: BN;
  low: BN;
  high: BN;
};
