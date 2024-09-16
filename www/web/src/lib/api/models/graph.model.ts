import { safeBN, unsafeBnToNumber } from "@hashfund/bn";
import BN from "bn.js";
import { Swap } from "./swap.model";

export type Graph = {
  high: number;
  low: number;
  open: number;
  close: number;
  time: number;
};

export const mapSwapToGraph = (swaps: Swap[]): Graph[] =>
  swaps.map((swap) => {
    const marketCap = unsafeBnToNumber(
      safeBN(swap.marketCap, 9).div(new BN(10).pow(new BN(9))),
      9
    );

    return {
      high: marketCap,
      close: marketCap,
      low: marketCap,
      open: marketCap,
      time: Date.parse(swap.time),
    };
  });

export const getSwapSol = (swap: Swap) => {
  let amount!: string;

  switch (swap.tradeDirection) {
    case 0:
    case 2:
      amount = swap.amountIn;
      break;
    case 1:
      amount = swap.amountOut;
      break;
  }

  return unsafeBnToNumber(
    safeBN(new BN(amount)).div(new BN(10).pow(new BN(9)))
  );
};

export const getSwapMint = (swap: Swap) => {
  let amount!: string;

  switch (swap.tradeDirection) {
    case 0:
    case 2:
      amount = swap.amountOut;
      break;
    case 1:
      amount = swap.amountIn;
      break;
  }

  return unsafeBnToNumber(
    safeBN(new BN(amount)).div(new BN(10).pow(new BN(6)))
  );
};
