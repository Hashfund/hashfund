import { BN } from "@coral-xyz/anchor";
import { safeBN, unsafeBN, unsafeBnToNumber } from "@hashfund/bn";

export enum TradeDirection {
  AtoB = 0,
  BtoA = 1,
}

export abstract class CurveCalculator {
  abstract calculateInitialPrice(): number;
  static calculateAmountOut(
    initialPrice: number,
    amount: BN,
    tradeDirection: TradeDirection
  ): BN {
    throw new Error("method not implemented");
  }
}

export class ConstantCurveCalculator implements CurveCalculator {
  constructor(
    private supply: BN,
    private maximumTokenBReserveBalance: BN,
    private liquidityPercentage: number
  ) {}

  get tokenBReserveBalance() {
    return this.maximumTokenBReserveBalance
      .mul(new BN(this.liquidityPercentage))
      .div(new BN(100));
  }

  get boundingCurveSupply() {
    return this.supply.mul(new BN(this.liquidityPercentage)).div(new BN(100));
  }

  calculateInitialPrice(): number {
    const supply = this.boundingCurveSupply;
    const tokenBReserveBalance = this.tokenBReserveBalance;

    return unsafeBnToNumber(safeBN(tokenBReserveBalance).div(supply));
  }

  static calculateAmountOut(
    initialPrice: number,
    amount: BN,
    tradeDirection: TradeDirection
  ): BN {
    const [, radix] = initialPrice.toString().split(".");
    const decimals = radix.length;

    const price = safeBN(Number(initialPrice), decimals);

    switch (tradeDirection) {
      case TradeDirection.AtoB:
        return unsafeBN(price.mul(amount), decimals);
      case TradeDirection.BtoA:
        return unsafeBN(amount.div(price), decimals);
    }
  }

  static calculateAmountOutNumber(
    initialPrice: number,
    amount: number,
    tradeDirection: TradeDirection
  ): number {
    switch (tradeDirection) {
      case TradeDirection.AtoB:
        return initialPrice * amount;
      case TradeDirection.BtoA:
        return amount / initialPrice;
    }
  }
}
