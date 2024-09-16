import { ErrorMessage, Field, useFormik, useFormikContext } from "formik";

type InputProps = {
  label: string;
} & React.ComponentProps<typeof Field>;

export default function Input({ label, ...props }: InputProps) {
  const { setFieldValue } = useFormikContext();
  if (props.type === "file")
    props.onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.currentTarget.files;
      if (files && files.length > 0)
        setFieldValue(props.name, URL.createObjectURL(files[0]));
    };

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex flex-col space-y-1">
        <label className="text-sm text-amber-50/80">{label}</label>
        <div className="flex border-1 border-amber-50/50 rounded from-black/10 bg-gradient-to-r focus-within:border-amber focus-within:ring-2 focus-within:ring-offset-3 focus-within:ring-amber/50 focus-within:ring-offset-transparent">
          <Field
            {...props}
            className="flex-1 bg-transparent p-2 outline-none placeholder-text-sm placeholder-amber-50/50"
          />
        </div>
      </div>
      <small className="text-sm text-red first-letter:capitalize">
        <ErrorMessage name={props.name} />
      </small>
    </div>
  );
}
