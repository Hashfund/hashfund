import { Form, Formik } from "formik";
import { TabPanel } from "@headlessui/react";
import {
  createInitialDepositSchema,
  MintInitialBuyAmountForm,
  MintMaximumMarketCapForm,
  MintMetadataForm,
} from "@/form/MintForm";
import useBalance from "@/composables/useBalance";
import CollateralInput from "./CollateralInput";

type CreateFormDepositProps = {
  ticker: string;
  mint: MintMetadataForm;
  maximumMarketcap: MintMaximumMarketCapForm;
  form: MintInitialBuyAmountForm;
  onSubmit: (value: MintInitialBuyAmountForm) => Promise<void>;
};

export default function CreateFormDeposit({
  ticker,
  form,
  mint,
  maximumMarketcap,
  onSubmit,
}: CreateFormDepositProps) {
  const { solBalance } = useBalance();
  const balance = solBalance / 1_000_000_000;
  const validationSchema = createInitialDepositSchema(balance);

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
        autocomplete="off"
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
                mint={mint}
                maximumMarketCap={maximumMarketcap}
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
