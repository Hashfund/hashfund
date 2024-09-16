import { ErrorMessage, useFormikContext } from "formik";
import { TbArrowsExchange } from "react-icons/tb";

import { PythFeed } from "@/config/pyth";
import useFeedPrice from "@/lib/api/useFeedPrice";

import TokenPriceInput from "../widgets/TokenPriceInput";

export default function MaximumMarketCapInput() {
  const { setFieldValue } = useFormikContext<{
    [key: string]: number;
  }>();

  const solPrice = useFeedPrice(PythFeed.SOL_USD);

  return (
    <div className="flex flex-1 flex-col rounded-md bg-dark-700 p-2 space-y-2">
      <div>
        <TokenPriceInput
          name="maximumMarketCap"
          image="/sol.png"
          ticker={"SOL"}
          onChange={(value) => {
            const usdPrice = value * solPrice;
            setFieldValue("maximumMarketCap", value);
            setFieldValue("maximumMarketCapPc", usdPrice.toFixed(2));
          }}
        />
        <small className="text-xs text-red">
          <ErrorMessage name="maximumMarketCap" />
        </small>
      </div>
      <div className="self-center">
        <button className="rounded-full bg-primary p-2">
          <TbArrowsExchange className="text-2xl text-black" />
        </button>
      </div>
      <div>
        <TokenPriceInput
          name="maximumMarketCapPc"
          image="/usdt.png"
          ticker={"USDT"}
          onChange={(value) => {
            setFieldValue("maximumMarketCap", value / solPrice);
            setFieldValue("maximumMarketCapPc", value);
          }}
        />
        <small className="text-xs text-red">
          <ErrorMessage name="maximumMarketCapPc" />
        </small>
      </div>
    </div>
  );
}
