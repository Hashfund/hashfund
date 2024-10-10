import { TbArrowsExchange } from "react-icons/tb";
import { ErrorMessage, useFormikContext } from "formik";
import { ConstantCurveCalculator, TradeDirection } from "@hashfund/zeroboost";

import { PythFeed } from "@/config/pyth";
import { MintSupplyForm } from "@/form/MintForm";
import { MetadataForm } from "@/form/MetadataForm";
import useBalance from "@/composables/useBalance";
import { useProgram } from "@/composables/useProgram";
import { useFeedPrice } from "@/composables/useFeedPrice";
import { denormalizeBN, normalizeBN } from "@/web3/decimal";

import TokenPriceInput from "../widgets/TokenPriceInput";

type Props = {
  metadataForm: MetadataForm;
  supplyForm: MintSupplyForm;
};

export default function CollateralInput({ metadataForm, supplyForm }: Props) {
  const { config } = useProgram();
  const solPrice = useFeedPrice(PythFeed.SOL_USD);
  const { solBalance } = useBalance();
  const { setFieldValue } = useFormikContext<{
    pairAmount: number;
    tokenAmount: number;
  }>();
  const curve = new ConstantCurveCalculator(
    denormalizeBN(supplyForm.supply, 6),
    denormalizeBN(config.maximumCurveUsdValuation / solPrice, 9),
    supplyForm.liquidityPercentage
  );

  const balance = normalizeBN(solBalance, 9);
  const initialPrice = curve.calculateInitialPrice();

  return (
    <div className="flex flex-col space-y-8">
      <div className="flex flex-1 flex-col rounded-md bg-dark-700 p-2 space-y-2">
        <div className="flex flex-col space-y-2">
          <div className="self-end text-xs text-white/75">{balance}</div>
          <TokenPriceInput
            balance={balance}
            name="pairAmount"
            image="/sol.png"
            ticker={"SOL"}
            onChange={(value) => {
              console.log(
                "onchange",
                [
                  denormalizeBN(supplyForm.supply, 6),
                  denormalizeBN(config.maximumCurveUsdValuation / solPrice, 9),
                  denormalizeBN(value, 9),
                ].map((bn) => bn.toString())
              );

              const tokenAmount = ConstantCurveCalculator.calculateAmountOut(
                initialPrice,
                denormalizeBN(Number(value), 9),
                TradeDirection.BtoA
              );
              setFieldValue("pairAmount", value);
              setFieldValue("tokenAmount", normalizeBN(tokenAmount, 6));
            }}
          />
          <small className="text-xs text-red">
            <ErrorMessage name="pairAmount" />
          </small>
        </div>
        <div className="self-center">
          <button className="rounded-full bg-primary p-2">
            <TbArrowsExchange className="text-2xl text-black" />
          </button>
        </div>
        <div className="flex flex-col">
          <TokenPriceInput
            name="tokenAmount"
            image={URL.createObjectURL(metadataForm.image)}
            ticker={metadataForm.symbol}
            onChange={(value) => {
              console.log("onchange", denormalizeBN(value, 6).toString());
              const solAmount = ConstantCurveCalculator.calculateAmountOut(
                initialPrice,
                denormalizeBN(value, 6),
                TradeDirection.AtoB
              );
              setFieldValue("pairAmount", solAmount);
              setFieldValue("tokenAmount", value);
            }}
          />
          <small className="text-xs text-red">
            <ErrorMessage name="tokenAmount" />
          </small>
        </div>
      </div>
    </div>
  );
}
