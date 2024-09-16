import { Formik, Form } from "formik";
import { TabPanel } from "@headlessui/react";

import { MintMetadataForm, validateMetadataSchema } from "@/form/MintForm";

import Input from "../widgets/Input";
import FileInput from "../widgets/FileInput";

type CreateFormMetadataProps = {
  form: MintMetadataForm;
  onSubmit: (value: MintMetadataForm) => void;
};

export default function CreateFormMetadata({
  form,
  onSubmit,
}: CreateFormMetadataProps) {
  return (
    <TabPanel>
      <Formik
        validationSchema={validateMetadataSchema}
        initialValues={form}
        onSubmit={(value, { setSubmitting }) => {
          onSubmit(value);
          setSubmitting(false);
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
              Continue
            </button>
          </Form>
        )}
      </Formik>
    </TabPanel>
  );
}
