import {  useMemo } from "react";
import { Form, Formik } from "formik";
import { TabPanel } from "@headlessui/react";

import { normalizeBN } from "@/web3/decimal";
import useBalance from "@/composables/useBalance";
import type { MetadataForm } from "@/form/MetadataForm";
import {
  createInitialBuySchema,
  type MintInitialBuyForm,
  type MintSupplyForm,
} from "@/form/MintForm";

import CollateralInput from "./CollateralInput";

type CreateFormDepositProps = {
  metadataForm: MetadataForm;
  mintSupplyForm: MintSupplyForm;
  form: MintInitialBuyForm;
  onSubmit: (value: MintInitialBuyForm) => Promise<void>;
};

export default function CreateFormInitialBuy({
  form,
  metadataForm,
  mintSupplyForm,
  onSubmit,
}: CreateFormDepositProps) {
  const { solBalance } = useBalance();
  const balance = normalizeBN(0, 9);
  const validationSchema = useMemo(
    () => createInitialBuySchema(balance),
    [balance]
  );

  return (
    <TabPanel className="flex flex-1 flex-col space-y-8">
      <div>
        <h1 className="text-xl font-bold">Purchase token</h1>
        <p className="text-sm text-gray-200">
          Developer can buy in some token before launch on hashfund
        </p>
      </div>
      <Formik
        initialValues={form}
        validationSchema={validationSchema}
        onSubmit={(values, { setSubmitting }) => {
          onSubmit(values).finally(() => setSubmitting(false));
        }}
      >
        {({ isSubmitting }) => (
          <Form
            autoComplete="off"
            className="flex flex-1 flex-col space-y-4"
          >
            <div className="flex-1">
              <CollateralInput
                metadataForm={metadataForm}
                supplyForm={mintSupplyForm}
              />
            </div>
            <button
              disabled={isSubmitting}
              className="btn btn-primary"
            >
              {isSubmitting ? (
                <div className="h-6 w-6 animate-spin border-2 border-black border-t-transparent rounded-full" />
              ) : (
                <span>Create Token</span>
              )}
            </button>
          </Form>
        )}
      </Formik>
    </TabPanel>
  );
}
