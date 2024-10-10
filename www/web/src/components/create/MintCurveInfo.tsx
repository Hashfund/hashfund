import type { ConstantCurveCalculator } from "@hashfund/zeroboost";

import { formatPrice } from "@/web3";
import { normalizeBN } from "@/web3/decimal";
import { useProgram } from "@/composables/useProgram";

type Props = {
  solPrice: number;
  curve: ConstantCurveCalculator;
};

export default function MintCurveInfo({ solPrice, curve }: Props) {
  const { config } = useProgram();

  return (
    <div className="text-xs opacity-75">
      The Token will be launched on hashfund at&nbsp;
      <pre className="inline text-amber">
        {formatPrice(config.minimumCurveUsdValuation)}
      </pre>
      &nbsp; marketcap, and it'll require&nbsp;
      <pre className="inline text-amber">
        {config.maximumCurveUsdValuation / solPrice}&nbsp;SOL
      </pre>
      &nbsp;to buy off&nbsp;
      <pre className="inline text-amber">
        {normalizeBN(curve.boundingCurveSupply, 6)}&nbsp;Token
      </pre>
      &nbsp; available for sale in the bounding curve and launch on raydium
      at&nbsp;
      <pre className="inline text-amber">
        {formatPrice(config.maximumCurveUsdValuation)}
      </pre>
      &nbsp; marketcap
    </div>
  );
}
