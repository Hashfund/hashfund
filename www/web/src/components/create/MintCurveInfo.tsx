import type { ConstantCurveCalculator } from "@hashfund/zeroboost";

import { useProgram } from "@/composables/useProgram";
import { formatPrice } from "@/web3/price";
import { deriveCurvePhysics } from "@/web3/curve";

type Props = {
  solPrice: number;
  curve: ConstantCurveCalculator;
};

export default function MintCurveInfo({ solPrice, curve }: Props) {
  const { config } = useProgram();

  const supplyNorm = Number.parseFloat((curve as any).supply.toString()) / 1e6;

  if (!solPrice || solPrice <= 0 || !config || !curve || supplyNorm <= 0) {
    return (
      <div className="text-xs opacity-75 animate-pulse">
        Finalizing bonding curve metrics...
      </div>
    );
  }

  const P = (curve as any).liquidityPercentage || 80;
  
  // Safe limits for empty forms
  let totalSupplyNominal = 10_000_000_000;
  try {
    totalSupplyNominal = Number.parseFloat((curve as any).totalSupply.toString()) / 1e6;
  } catch (e) {}

  const physics = deriveCurvePhysics(totalSupplyNominal, P, solPrice);

  return (
    <div className="text-xs opacity-75 leading-relaxed">
      The Token will be launched on Hashfund at&nbsp;
      <pre className="inline font-bold text-amber-400">
        {formatPrice(physics.launchMarketCapUsd)}
      </pre>
      &nbsp;market cap, and it'll require&nbsp;
      <pre className="inline font-bold text-amber-400">
        {physics.solRequired.toFixed(2)}&nbsp;SOL
      </pre>
      &nbsp;to buy off&nbsp;
      <pre className="inline font-bold text-amber-400">
        {physics.tokensInCurve.toLocaleString()}&nbsp;Tokens
      </pre>
      &nbsp;available for sale in the bonding curve and graduate to Raydium
      at a&nbsp;
      <pre className="inline font-bold text-amber-400">
        {formatPrice(physics.raydiumMarketCapUsd)}
      </pre>
      &nbsp;market cap.
    </div>
  );
}
