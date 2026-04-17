import { normalizeBN } from "./decimal";
import type { MintWithExtra } from "@hashfund/sdk/models";
import { calculateTokenPriceSol, calculateMarketCap, calculateBondingProgress, deriveCurvePhysics, getNominalSupply } from "./curve";

export interface MintMetrics {
  displayPriceUsd: number;
  marketCapUsd: number;
  buyVolumeUsd: number;
  sellVolumeUsd: number;
  totalVolumeUsd: number;
  bondingProgress: number;
  raydiumTargetUsd: number;
  solRaised: number;
  solRequired: number;
  nominalSupply: number;
}

/**
 * Returns a unified set of metrics for a given mint, ensuring consistency across all dashboards.
 */
export function getMintMetrics(mint: MintWithExtra, solPrice: number): MintMetrics {
  const priceInSol = calculateTokenPriceSol(
    mint.boundingCurve.virtualTokenBalance,
    mint.boundingCurve.virtualPairBalance,
    mint.decimals
  );

  const nominalSupply = getNominalSupply(mint);
  const lpPercentage = Number.parseFloat(mint.boundingCurve.liquidityPercentage as any) || 80;

  const marketCapUsd = priceInSol * nominalSupply * solPrice;
  const bondingProgress = calculateBondingProgress(mint, solPrice);
  
  // Volume calculation (Always converted to USD for unified display)
  const buyVolumeUsd = normalizeBN(mint.market?.buyVolume ?? 0, 9) * solPrice;
  const sellVolumeUsd = normalizeBN(mint.market?.sellVolume ?? 0, 9) * solPrice;
  const totalVolumeUsd = normalizeBN(mint.market?.pairVolume ?? 0, 9) * solPrice;

  // Physics for targets
  const physics = deriveCurvePhysics(
    nominalSupply, 
    lpPercentage, 
    solPrice
  );

  const solRaised = normalizeBN(mint.boundingCurve.virtualPairBalance, 9) - physics.vp_0;

  return {
    displayPriceUsd: priceInSol * solPrice,
    marketCapUsd,
    buyVolumeUsd,
    sellVolumeUsd,
    totalVolumeUsd,
    bondingProgress,
    raydiumTargetUsd: physics.raydiumMarketCapUsd,
    solRaised,
    solRequired: physics.solRequired,
    nominalSupply
  };
}
