export enum TradeDirection {
  AToB,
  BToA,
}

abstract class CurveCalculator {
  constructor(
    readonly currentSupply: number,
    readonly maximumMarketCap: number
  ) {}
  abstract calculateInitialPrice(): number;
}

export default class ConstantCurve extends CurveCalculator {
  calculateInitialPrice() {
    return this.maximumMarketCap / this.currentSupply;
  }

  static calculateTokenOut(
    initialPrice: number,
    amount: number,
    decimals: number,
    tradeDirection: TradeDirection
  ): number {
    switch (tradeDirection) {
      case TradeDirection.AToB:
        return initialPrice * (amount * Math.pow(10, decimals));
      case TradeDirection.BToA:
        return (amount * Math.pow(10, decimals)) / initialPrice;
    }
  }

  static normalize(value: number, decimals: number) {
    return value * Math.pow(10, decimals);
  }

  static toUIAmount(value: number, decimals: number) {
    return value / Math.pow(10, decimals);
  }

  static getBoundingCurveSupply(
    percentageIntoLiquidty: number,
    totalSupply: number
  ) {
    const liquiditySupply = (totalSupply * percentageIntoLiquidty) / 100;
    return totalSupply - liquiditySupply;
  }
}

export class ConstantLiquidityCurve {
  readonly currentSupply: number;
  readonly liquiditySupply: number;

  constructor(
    readonly totalSupply: number,
    readonly liquidityPercentage: number,
    readonly virtualMarketCap: number
  ) {
    this.liquiditySupply = (totalSupply * liquidityPercentage) / 100;
    this.currentSupply = totalSupply - this.liquiditySupply;
  }

  getRaydiumLaunchMarketcap() {
    const curve = new ConstantCurve(this.currentSupply, this.virtualMarketCap);
    const virtualStartPrice = curve.calculateInitialPrice();
    return this.liquiditySupply * virtualStartPrice;
  }
}
