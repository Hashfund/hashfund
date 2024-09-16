import { PythFeed } from "@/config/pyth";
import type {
  MintMaximumMarketCapForm,
  MintMetadataForm,
} from "@/form/MintForm";
import useFeedPrice from "@/lib/api/useFeedPrice";

type MintInfoProps = {
  mint: MintMetadataForm;
  maximumMarketCap: MintMaximumMarketCapForm;
  initialPrice: number;
  boundingCurve: number;
  boundingCurveSOL: number;
};

export default function MintInfo({
  initialPrice,
  maximumMarketCap,
  boundingCurve,
  boundingCurveSOL,
  mint,
}: MintInfoProps) {
  return (
    <div className="flex flex-col rounded-md bg-dark-700 p-4 text-xs space-y-2">
      <div className="flex items-center">
        <p className="flex-1 text-white/75">Initial Price</p>
        <p>{initialPrice} SOL</p>
      </div>
      <div className="flex items-center">
        <p className="flex-1 text-white/75">Bounding Curve</p>
        <p>
          {boundingCurve} <span className="uppercase">{mint.symbol}</span>
        </p>
      </div>
      <div className="flex items-center">
        <p className="flex-1 text-white/75">Bounding Curve Valuation</p>
        <p>{boundingCurveSOL} SOL</p>
      </div>
      <div className="flex items-center">
        <p className="flex-1 text-white/75">
          Token Estimated in Liquidity
        </p>
        <p>
          {Number(maximumMarketCap.totalSupply) - boundingCurve}{" "}
          <span className="uppercase">{mint.symbol}</span>
        </p>
      </div>
    </div>
  );
}
