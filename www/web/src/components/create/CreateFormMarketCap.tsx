import { TabPanel } from "@headlessui/react";
import { ErrorMessage, Field, Form, Formik } from "formik";

import {
  MintMaximumMarketCapForm,
  validateMaximumMarketCapSchema,
} from "@/form/MintForm";
import MaximumMarketCapInput from "./MaximumMarketcapInput";
import LiquidityPercentageInput from "./LiquidityPercentageInput";
import { useMemo } from "react";
import ConstantCurve, { ConstantLiquidityCurve } from "@/web3/bounding_curve";
import useFeedPrice from "@/lib/api/useFeedPrice";
import { PythFeed } from "@/config/pyth";
import { formatPrice } from "@/web3/price";

type CreateFormMarketcapProps = {
  ticker: string;
  form: MintMaximumMarketCapForm;
  onSubmit: (value: MintMaximumMarketCapForm) => void;
};

export default function CreateFormMarketCap({
  form,
  onSubmit,
}: CreateFormMarketcapProps) {
  return (
    <TabPanel className="flex flex-1 flex-col space-y-8">
      <div className="text-center">
        <h1 className="text-xl">Bounding Curve Setting</h1>
        <p className="text-sm text-stone-300">
          Set maximum market cap & token supply
        </p>
      </div>
      <Formik
        initialValues={form}
        validationSchema={validateMaximumMarketCapSchema}
        onSubmit={(values, { setSubmitting }) => {
          onSubmit(values);
          setSubmitting(false);
        }}
      >
        {({ values, isSubmitting, setFieldValue }) => {
          const solPrice = useFeedPrice(PythFeed.SOL_USD);
          const liquidityCurve = useMemo(
            () =>
              new ConstantLiquidityCurve(
                values.totalSupply,
                values.liquidityPercentage,
                60000 / solPrice
              ),
            [values]
          );

          const curve = useMemo(
            () =>
              new ConstantCurve(
                liquidityCurve.currentSupply,
                liquidityCurve.getRaydiumLaunchMarketcap()
              ),
            [liquidityCurve]
          );

          return (
            <Form
              autoComplete="off"
              className="flex flex-1 flex-col space-y-8"
            >
              <div className="flex flex-1 flex-col space-y-4">
                <div className="flex flex-col space-y-2">
                  <label className="text-sm">Token Supply</label>
                  <Field
                    name="totalSupply"
                    className="rounded bg-dark-700 p-3"
                    placeholder="Token total supply"
                  />
                  <small className="text-xs text-red">
                    <ErrorMessage name="tokenSupply" />
                  </small>
                </div>
                <div className="flex flex-col space-y-2">
                  <label className="text-sm">% into Percentage</label>
                  <LiquidityPercentageInput />
                  <p className="text-xs opacity-75">
                    The Token will be launched on hashfund at&nbsp;
                    <pre className="inline text-amber">
                      {formatPrice(solPrice * liquidityCurve.virtualMarketCap)}
                    </pre>
                    &nbsp; marketcap, and it'll require&nbsp;
                    <pre className="inline text-amber">
                      {liquidityCurve.getRaydiumLaunchMarketcap()}
                      SOL
                    </pre>
                    &nbsp;to buy off&nbsp;
                    <pre className="inline text-amber">
                      {liquidityCurve.currentSupply}Token
                    </pre>
                    &nbsp; available for sale in the bounding curve and launch
                    on raydium at&nbsp;
                    <pre className="inline text-amber">
                      {formatPrice(
                        solPrice * liquidityCurve.getRaydiumLaunchMarketcap()
                      )}
                    </pre>
                    &nbsp; marketcap
                  </p>
                </div>
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary"
                onClick={() => {
                  setFieldValue(
                    "maximumMarketCap",
                    liquidityCurve.getRaydiumLaunchMarketcap()
                  );
                }}
              >
                Continue
              </button>
            </Form>
          );
        }}
      </Formik>
    </TabPanel>
  );
}
