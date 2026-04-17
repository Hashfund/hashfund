import { BN } from "@coral-xyz/anchor";
import { safeBN, unsafeBN, unsafeBnToNumber } from "@hashfund/bn";

export enum TradeDirection {
  AtoB = 0,
  BtoA = 1,
}

export abstract class CurveCalculator {
  abstract calculateInitialPrice(): number;
  static calculateAmountOut(
    virtualTokenReserve: BN,
    virtualPairReserve: BN,
    amount: BN,
    tradeDirection: TradeDirection
  ): BN {
    throw new Error("method not implemented");
  }
}

export class ConstantCurveCalculator {
  private virtualTokenSupply: number;
  private vp_0: number;

  constructor(
    private rawSupply: BN,
    public liquidityPercentage: number,
    public decimals: number = 6
  ) {
    if (rawSupply.isZero()) {
      this.virtualTokenSupply = 0;
      this.vp_0 = 0;
      return;
    }

    const supplyNorm = Number.parseFloat(rawSupply.toString()) / (10 ** decimals);
    
    // Protocol Constants
    const vp_0 = 30.0;
    const targetRaiseSol = 85.0;
    const vp_final = vp_0 + targetRaiseSol; // 115.0
    
    // Calculate alpha dynamically based on liquidity percentage.
    // This ensures that exactly (supply * P%) is sold to raise exactly targetRaiseSol.
    // Formula: vt_0 = (NominalSupply * LP%) / (1 - (vp_0 / vp_final))
    const lpFactor = liquidityPercentage / 100;
    const alpha = lpFactor * (vp_final / targetRaiseSol);
    
    this.virtualTokenSupply = supplyNorm * alpha;
    this.vp_0 = vp_0;
  }

  /**
   * Returns the initial virtual token reserve (e.g. 10.8T for 10T supply at 80% liquidity)
   */
  get virtualTokenReserve() {
    const val = Number.isNaN(this.virtualTokenSupply) ? 0 : this.virtualTokenSupply;
    return unsafeBN(new BN(BigInt(Math.round(val * (10 ** this.decimals))).toString()));
  }

  get tokenBReserveBalance() {
    const val = Number.isNaN(this.vp_0) ? 0 : this.vp_0;
    return unsafeBN(new BN(BigInt(Math.round(val * 1e9)).toString()));
  }

  get bondingCurveSupply() {
    return this.rawSupply.mul(new BN(this.liquidityPercentage)).div(new BN(100));
  }
  
  // Legacy alias to not break existing strict references
  get boundingCurveSupply() {
    return this.bondingCurveSupply;
  }

  /**
   * Returns the tokens actually available for sale in the curve (e.g. 8T for 10T supply at 80% liquidity)
   */
  get tokensInCurve() {
    return this.bondingCurveSupply;
  }

  get supply() {
    return this.rawSupply;
  }
  
  get virtualSupply() {
    return this.virtualTokenReserve;
  }
  
  get totalSupply() {
    return this.rawSupply;
  }

  calculateInitialPrice(): number {
    if (this.virtualTokenSupply === 0) return 0;
    return this.vp_0 / this.virtualTokenSupply;
  }

  static calculateAmountOut(
    virtualTokenReserve: BN,
    virtualPairReserve: BN,
    amount: BN,
    tradeDirection: TradeDirection,
    isMigrated: boolean = false
  ): BN {
    if (amount.isZero() || virtualTokenReserve.isZero() || virtualPairReserve.isZero()) {
      return new BN(0);
    }

    switch (tradeDirection) {
      case TradeDirection.BtoA: {
        // Buy tokens (A) with SOL (B)
        // Buy Fee: 0% ("just gas")
        // out_tokens = (token_reserve * amount) / (sol_reserve + amount)
        const numerator = virtualTokenReserve.mul(amount);
        const denominator = virtualPairReserve.add(amount);
        return numerator.div(denominator);
      }
      case TradeDirection.AtoB: {
        // Sell tokens (A) for SOL (B)
        // Sell Fee: 5% SOL if not migrated, 0% if migrated
        // gross_sol = (sol_reserve * amount) / (token_reserve + amount)
        const numerator = virtualPairReserve.mul(amount);
        const denominator = virtualTokenReserve.add(amount);
        const grossSol = numerator.div(denominator);
        
        if (isMigrated) return grossSol;
        
        // Subtract 5% fee from SOL output: grossSol * 0.95
        return grossSol.mul(new BN(95)).div(new BN(100));
      }
    }
  }

  static calculateAmountOutNumber(
    virtualTokenReserve: number,
    virtualPairReserve: number,
    amount: number,
    tradeDirection: TradeDirection,
    isMigrated: boolean = false
  ): number {
    if (amount <= 0 || virtualTokenReserve <= 0 || virtualPairReserve <= 0) return 0;
    
    // Virtual AMM Math: Token * Pair = K
    const k = virtualTokenReserve * virtualPairReserve;

    switch (tradeDirection) {
      case TradeDirection.BtoA: // Buying tokens with SOL
        // Buy Fee: 0% ("just gas")
        const newVirtualPairReserveBuy = virtualPairReserve + amount;
        const newVirtualTokenReserveBuy = k / newVirtualPairReserveBuy;
        return virtualTokenReserve - newVirtualTokenReserveBuy;
        
      case TradeDirection.AtoB: // Selling/Withdrawing tokens
        // Sell Fee: 5% if not migrated
        const newVirtualTokenReserveSell = virtualTokenReserve + amount;
        const newVirtualPairReserveSell = k / newVirtualTokenReserveSell;
        const grossSol = virtualPairReserve - newVirtualPairReserveSell;
        
        return isMigrated ? grossSol : grossSol * 0.95;
    }
  }
}
