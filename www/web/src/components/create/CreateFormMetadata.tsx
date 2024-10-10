import { Formik, Form } from "formik";
import { TabPanel } from "@headlessui/react";

import { type MetadataForm, validateMetadataSchema } from "@/form/MetadataForm";

import Input from "../widgets/Input";
import FileInput from "../widgets/FileInput";

type CreateFormMetadataProps = {
  form: MetadataForm;
  onSubmit: (value: MetadataForm) => Promise<void>;
};

export default function CreateFormMetadata({
  form,
  onSubmit,
}: CreateFormMetadataProps) {
  return (
    <TabPanel>
      <Formik
        initialValues={form}
        validationSchema={validateMetadataSchema}
        onSubmit={(value, { setSubmitting }) => {
          onSubmit(value).finally(() => setSubmitting(false));
        }}
      >
        {({ isSubmitting }) => (
          <Form
            autoComplete="off"
            className="flex flex-1 flex-col space-y-8"
          >
            <div className="flex flex-col space-y-2">
              <Input
                name="name"
                label="Name"
                placeholder="Token Name"
              />
              <Input
                name="symbol"
                label="Symbol"
                placeholder="Token Ticker"
              />
              <FileInput
                name="image"
                label="Image"
                placeholder="Image"
                type="file"
                accept="image/*"
              />
              <Input
                name="description"
                label="Description"
                placeholder="Token Description"
                as="textarea"
              />
              <Input
                name="website"
                label="Website(Optional)"
                placeholder="Website link"
              />
              <Input
                name="telegram"
                label="Telegram(Optional)"
                placeholder="Telegram link"
              />
              <Input
                name="twitter"
                label="Twitter(Optional)"
                placeholder="Twitter link"
              />
            </div>
            <button
              disabled={isSubmitting}
              type="submit"
              className="btn btn-primary"
            >
              {
                isSubmitting ? <div className="w-6 h-6 border-2 border-black border-t-transparent animate-spin rounded-full" /> :  <span>Continue</span>
              }
            </button>
          </Form>
        )}
      </Formik>
    </TabPanel>
  );
}
