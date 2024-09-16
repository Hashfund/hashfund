import { User } from "./user.model";

export type Swap = {
  id: number;
  mint: string;
  amountIn: string;
  amountOut: string;
  tradeDirection: 0 | 1 | 2;
  marketCap: number;
  timestamp: string;
  time: string;
  payer: User;
  signature: string;
};

export type UserMintSwap = {
  bought: string;
  sold: string;
};

export const mapTradeDirection = (direction: Swap["tradeDirection"]) => {
  switch (direction) {
    case 0:
      return "buy";
    case 1:
      return "sell";
    case 2:
      return "burn";
  }
};
export const mapSwapAmountSol = (swap: Swap) => {
  switch (swap.tradeDirection) {
    case 0:
      return swap.amountIn;
    case 1:
      return swap.amountOut;
    case 2:
      return swap.amountIn;
  }
};

export const mapSwapAmountToken = (swap: Swap) => {
  switch (swap.tradeDirection) {
    case 0:
      return swap.amountOut;
    case 1:
      return swap.amountIn;
    case 2:
      return swap.amountOut;
  }
};
