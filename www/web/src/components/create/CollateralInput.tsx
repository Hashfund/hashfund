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
import { useMemo, useState } from "react";

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
  const curve = useMemo(
    () =>
      new ConstantCurveCalculator(
        denormalizeBN(supplyForm.supply, metadataForm.decimals),
        supplyForm.liquidityPercentage,
        metadataForm.decimals
      ),
    [config, supplyForm, metadataForm.decimals]
  );

  const balance = useMemo(() => normalizeBN(solBalance, 9), [solBalance]);
  // Pull native Javascript bounds directly from the pure mathematical constants generated in the class constructor 
  // to avoid arbitrary fractional truncation caused by the legacy unsafeBN wrapper inside the getters.
  const virtualTokenReserve = useMemo(() => {
     const rawVal = (curve as any).virtualTokenSupply;
     return Number.isNaN(rawVal) ? 0 : rawVal;
  }, [curve]);
  
  const virtualPairReserve = useMemo(() => {
     const rawVal = (curve as any).vp_0;
     return Number.isNaN(rawVal) ? 0 : rawVal;
  }, [curve]);
  console.log("Virtual Token Reserve:", virtualTokenReserve);
  console.log("Virtual Pair Reserve:", virtualPairReserve);
  console.log("=================");
  
  const [isSolFirst, setIsSolFirst] = useState(true);

  const solInputBlock = (
        <div className="flex flex-col space-y-2">
          <div className="self-end text-xs text-white/75">{balance}</div>
          <TokenPriceInput
            balance={balance}
            name="pairAmount"
            image="/sol.png"
            ticker={"SOL"}
            onChange={(value) => {
              let tokenAmount =
                ConstantCurveCalculator.calculateAmountOutNumber(
                  virtualTokenReserve,
                  virtualPairReserve,
                Number(value),
                TradeDirection.BtoA,
                false
              );
                
              tokenAmount = Math.floor(tokenAmount);

              setFieldValue("pairAmount", value);
              setFieldValue("tokenAmount", tokenAmount);
            }}
          />
          <small className="text-xs text-red">
            <ErrorMessage name="pairAmount" />
          </small>
        </div>
  );

  const tokenInputBlock = (
        <div className="flex flex-col space-y-2">
          <TokenPriceInput
            name="tokenAmount"
            image={URL.createObjectURL(metadataForm.image)}
            ticker={metadataForm.symbol}
            onChange={(value) => {
              // Exact Out Calculation for Pure Bonding Curve (How much SOL to extract Exact tokens)
              const numValue = Number(value);
              let solAmount = 0;
              if (numValue > 0 && numValue < virtualTokenReserve) {
                  const k = virtualTokenReserve * virtualPairReserve;
                  const newTokenReserve = virtualTokenReserve - numValue;
                  const newPairReserve = k / newTokenReserve;
                  solAmount = newPairReserve - virtualPairReserve;
              }
              setFieldValue("pairAmount", solAmount);
              setFieldValue("tokenAmount", value);
            }}
          />
          <small className="text-xs text-red">
            <ErrorMessage name="tokenAmount" />
          </small>
        </div>
  );

  return (
    <div className="flex flex-col space-y-8">
      <div className="flex flex-1 flex-col rounded-md bg-dark-700 p-2 space-y-2">
        {isSolFirst ? solInputBlock : tokenInputBlock}
        
        <div className="self-center z-10 -my-3">
          <button 
            type="button" 
            onClick={() => setIsSolFirst(!isSolFirst)}
            className="rounded-full bg-primary p-2 hover:opacity-90 transition-opacity"
          >
            <TbArrowsExchange className="text-2xl text-black rotate-90" />
          </button>
        </div>

        {isSolFirst ? tokenInputBlock : solInputBlock}
      </div>
    </div>
  );
}
