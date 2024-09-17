import { TbArrowsExchange } from "react-icons/tb";
import { ErrorMessage, useFormikContext } from "formik";

import useBalance from "@/composables/useBalance";
import ConstantCurve, { TradeDirection } from "@/web3/bounding_curve";
import { MintMaximumMarketCapForm, MintMetadataForm } from "@/form/MintForm";

import TokenPriceInput from "../widgets/TokenPriceInput";
import MintInfo from "./MintInfo";

type CollateralInputProps = {
  mint: MintMetadataForm;
  maximumMarketCap: MintMaximumMarketCapForm;
};

export default function CollateralInput({
  mint,
  maximumMarketCap,
}: CollateralInputProps) {
  const { solBalance } = useBalance();
  const { setFieldValue } = useFormikContext<{
    [key: string]: number;
  }>();

  const supplyFraction = 100 - Number(maximumMarketCap.liquidityPercentage);
  const boundingCurve = maximumMarketCap.totalSupply * (supplyFraction / 100);

  const curve = new ConstantCurve(
    boundingCurve,
    maximumMarketCap.maximumMarketCap
  );

  const balance = Number(Number(solBalance / 1_000_000_000).toFixed(4));
  const initialPrice = curve.calculateInitialPrice();

  return (
    <div className="flex flex-col space-y-8">
      <div className="flex flex-1 flex-col rounded-md bg-dark-700 p-2 space-y-2">
        <div className="flex flex-col space-y-2">
          <div className="self-end text-xs text-white/75">{balance}</div>
          <TokenPriceInput
            balance={balance}
            name="initialBuyAmount"
            image="/sol.png"
            ticker={"SOL"}
            onChange={(value) => {
              const tokenAmount = ConstantCurve.calculateTokenOut(
                initialPrice,
                value,
                0,
                TradeDirection.BToA
              );
              setFieldValue("initialBuyAmount", value);
              setFieldValue("initialBuyAmountPc", tokenAmount);
            }}
          />
          <small className="text-xs text-red">
            <ErrorMessage name="initialBuyAmount" />
          </small>
        </div>
        <div className="self-center">
          <button className="rounded-full bg-primary p-2">
            <TbArrowsExchange className="text-2xl text-black" />
          </button>
        </div>
        <div className="flex flex-col">
          <TokenPriceInput
            name="initialBuyAmountPc"
            image={URL.createObjectURL(mint.image)}
            ticker={mint.symbol}
            onChange={(value) => {
              const solAmount = ConstantCurve.calculateTokenOut(
                initialPrice,
                value,
                0,
                TradeDirection.AToB
              );
              setFieldValue("initialBuyAmount", solAmount);
              setFieldValue("initialBuyAmountPc", value);
            }}
          />
          <small className="text-xs text-red">
            <ErrorMessage name="initialBuyAmountPc" />
          </small>
        </div>
      </div>
      <MintInfo
        mint={mint}
        maximumMarketCap={maximumMarketCap}
        initialPrice={initialPrice}
        boundingCurve={boundingCurve}
        boundingCurveSOL={ConstantCurve.calculateTokenOut(
          initialPrice,
          boundingCurve,
          0,
          TradeDirection.AToB
        )}
      />
    </div>
  );
}
