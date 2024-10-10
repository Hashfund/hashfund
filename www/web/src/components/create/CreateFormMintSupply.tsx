import { useMemo } from "react";
import { BN } from "@coral-xyz/anchor";
import { TabPanel } from "@headlessui/react";
import { safeBN, unsafeBN } from "@hashfund/bn";
import { ErrorMessage, Field, Form, Formik } from "formik";
import { ConstantCurveCalculator } from "@hashfund/zeroboost";

import { denormalizeBN } from "@/web3";
import { PythFeed } from "@/config/pyth";
import { useProgram } from "@/composables/useProgram";
import { useFeedPrice } from "@/composables/useFeedPrice";
import { MintSupplyForm, validateMintSupplySchema } from "@/form/MintForm";

import MintCurveInfo from "./MintCurveInfo";
import PercentageInput from "../widgets/PercentageInput";

type Props = {
  form: MintSupplyForm;
  onSubmit: (value: MintSupplyForm) => Promise<void> | void;
};

export default function CreateFormMintSupply({ form, onSubmit }: Props) {
  const { config } = useProgram();
  const solPrice = useFeedPrice(PythFeed.SOL_USD);

  return (
    <TabPanel className="flex flex-1 flex-col space-y-8">
      <div className="text-center">
        <h1 className="text-xl">Bounding Curve Settings</h1>
        <p className="text-sm text-stone-300">
          Set token supply & liquidity percentage
        </p>
      </div>
      {config && (
        <Formik
          initialValues={form}
          validationSchema={validateMintSupplySchema}
          onSubmit={(values, { setSubmitting }) => {
            onSubmit(values);
            setSubmitting(false);
          }}
        >
          {({ values, isSubmitting }) => {
            const curve = useMemo(
              () =>
                new ConstantCurveCalculator(
                  unsafeBN(
                    safeBN(values.supply).mul(new BN(10).pow(new BN(6)))
                  ),
                  denormalizeBN(config.maximumCurveUsdValuation / solPrice, 9),
                  values.liquidityPercentage
                ),
              [values]
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
                      name="supply"
                      className="rounded bg-dark-700 p-3"
                      placeholder="Token total supply"
                    />
                    <small className="text-xs text-red">
                      <ErrorMessage name="supply" />
                    </small>
                  </div>
                  <div className="flex flex-col space-y-2">
                    <label className="text-sm">% into Percentage</label>
                    <PercentageInput name="liquidityPercentage" />
                    <small className="text-xs text-red">
                      <ErrorMessage name="liquidityPercentage" />
                    </small>
                  </div>
                  <div>
                    <MintCurveInfo
                      solPrice={solPrice}
                      curve={curve}
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-primary"
                >
                  Continue
                </button>
              </Form>
            );
          }}
        </Formik>
      )}
    </TabPanel>
  );
}
