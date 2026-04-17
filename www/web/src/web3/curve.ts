import { normalizeBN } from "./decimal";
import type { MintWithExtra } from "@hashfund/sdk/models";

/**
 * Derives exactly the real-time token price in SOL
 */
/**
 * Derives exactly the real-time token price in SOL
 */
/**
 * Calculates how many tokens you get for an amount of SOL (Buy) or vice versa (Sell)
 * with the appropriate fee mapping applied.
 */
export function calculateAmountOut(
  virtualTokenBalance: any,
  virtualPairBalance: any,
  amount: number,
  tradeDirection: number, // 0 = AtoB (Sell), 1 = BtoA (Buy)
  decimals: number = 6,
  isMigrated: boolean = false
): number {
  const vt = normalizeBN(virtualTokenBalance, decimals);
  const vp = normalizeBN(virtualPairBalance, 9);
  
  if (amount <= 0 || vt <= 0 || vp <= 0) return 0;
  const k = vt * vp;

  if (tradeDirection === 1) { // Buy Tokens with SOL
    // Buy Fee: 0% ("just gas")
    const newVp = vp + amount;
    const newVt = k / newVp;
    return vt - newVt;
  } else { // Sell Tokens for SOL
    // Sell Fee: 5% if not migrated
    const newVt = vt + amount;
    const newVp = k / newVt;
    const grossSol = vp - newVp;
    return isMigrated ? grossSol : grossSol * 0.95;
  }
}

export function calculateTokenPriceSol(
  virtualTokenBalance: any,
  virtualPairBalance: any,
  decimals: number = 6
): number {
  const vt = normalizeBN(virtualTokenBalance, decimals);
  const vp = normalizeBN(virtualPairBalance, 9);
  if (vt === 0) return 0;
  return vp / vt;
}

export function getNominalSupply(mint: MintWithExtra): number {
  return normalizeBN(mint.supply, mint.decimals);
}

/**
 * Standard Market Cap formulation (Price * Supply) as explicitly required by Pump.fun mechanics.
 */
export function calculateMarketCap(
  mint: MintWithExtra,
  solPrice: number
): number {
  const priceInSol = calculateTokenPriceSol(
    mint.boundingCurve.virtualTokenBalance,
    mint.boundingCurve.virtualPairBalance,
    mint.decimals
  );
  const totalSupply = getNominalSupply(mint);
  return priceInSol * totalSupply * solPrice;
}

/**
 * Universal Graduation Engine Physics Map
 * Reconstructs the exact bonding curve parameters symmetrically to predict final endpoints correctly.
 */
export function deriveCurvePhysics(
  totalSupplyNominal: number,
  liquidityPercentage: number,
  solPrice: number
) {
  const P = liquidityPercentage || 80;

  const f = P / 100;
  const ts = totalSupplyNominal * f;

  // Protocol Constants
  const vp_0 = 30.0;
  const targetRaiseSol = 85.0;
  const vp_final = vp_0 + targetRaiseSol; // 115.0

  // Calculate alpha identically to the smart contract
  let alphaScaled = 1082352941; // 80% default
  if (P === 50) alphaScaled = 772727272;
  else if (P === 70) alphaScaled = 980000000;
  else if (P === 90) alphaScaled = 1184210526;

  const alpha = alphaScaled / 1000000000;
  const vt_0 = totalSupplyNominal * alpha;
  const vtFinal = vt_0 - ts;
  
  const vpFinal = (vt_0 * vp_0) / vtFinal;


  // Graduation Math: 5% Bond Fee is taken from SOL raised
  const grossSolRaised = vpFinal - vp_0;
  const bondFee = grossSolRaised * 0.05;
  const netSolMigrated = grossSolRaised - bondFee;

  // Predict market cap targets naturally falling strictly from reserve math
  const finalPriceSol = vpFinal / vtFinal;
  const raydiumMarketCapUsd = finalPriceSol * totalSupplyNominal * solPrice;

  return {
    initialPriceSol: vp_0 / vt_0,
    finalPriceSol,
    launchMarketCapUsd: (vp_0 / vt_0) * totalSupplyNominal * solPrice,
    raydiumMarketCapUsd,
    vp_0,
    vt_0,
    vpFinal,
    vtFinal,
    solRequired: grossSolRaised,
    bondFee,
    netSolMigrated,
    tokensInCurve: ts,
  };
}

/**
 * Calculates current bonding curve completion percentage securely bounded between 0-100%
 */
export function calculateBondingProgress(
  mint: MintWithExtra,
  solPrice: number
): number {
  const totalSupply = getNominalSupply(mint);
  const P = Number.parseFloat(mint.boundingCurve.liquidityPercentage as any);
  const physics = deriveCurvePhysics(totalSupply, P, solPrice);

  const currentVp = normalizeBN(mint.boundingCurve.virtualPairBalance, 9);

  const solRaised = currentVp - physics.vp_0;
  const maxSolToRaise = physics.solRequired;

  let progress = (solRaised / maxSolToRaise) * 100;
  if (progress < 0) progress = 0;
  if (progress > 100) progress = 100;

  return progress;
}

/**
 * Calculates the actual Real SOL currently in the curve (subtracting the 30.0 SOL initial virtual depth).
 */
export function calculateRealSol(mint: MintWithExtra): number {
  const currentVp = normalizeBN(mint.boundingCurve.virtualPairBalance, 9);
  const totalSupply = getNominalSupply(mint);
  const P = Number.parseFloat(mint.boundingCurve.liquidityPercentage as any);
  const physics = deriveCurvePhysics(totalSupply, P, 1); // solPrice doesn't affect SOL counts

  const realSol = currentVp - physics.vp_0;
  return realSol < 0 ? 0 : realSol;
}

/**
 * Calculates exactly how much more Real SOL is needed to trigger graduation to Raydium.
 */
export function calculateSolToBond(mint: MintWithExtra): number {
  const currentVp = normalizeBN(mint.boundingCurve.virtualPairBalance, 9);
  const totalSupply = getNominalSupply(mint);
  const P = Number.parseFloat(mint.boundingCurve.liquidityPercentage as any);
  const physics = deriveCurvePhysics(totalSupply, P, 1);

  const solToBond = physics.vpFinal - currentVp;
  return solToBond < 0 ? 0 : solToBond;
}

/**
 * Calculates the 'Real' token balance remaining in the curve (nominal buys available).
 * This subtracts the virtual price-offset tokens from the total balance.
 */
export function calculateRealTokenRemaining(mint: MintWithExtra): number {
  const currentVt = normalizeBN(mint.boundingCurve.virtualTokenBalance, mint.decimals);
  const totalSupply = getNominalSupply(mint);
  const P = Number.parseFloat(mint.boundingCurve.liquidityPercentage as any);
  const physics = deriveCurvePhysics(totalSupply, P, 1);

  // The actual real tokens remaining is: ts - (vt_0 - currentVt)
  // Which simplifies to: currentVt - vtFinal
  const realTokens = currentVt - physics.vtFinal;

  return realTokens < 0 ? 0 : realTokens;
}
