import Image from "next/image";
import { ErrorMessage, Field, useFormikContext } from "formik";

type InputProps = {
  label: string;
} & React.ComponentProps<typeof Field>;

export default function FileInput({ label, ...props }: InputProps) {
  const { values, setFieldValue } = useFormikContext<{ [key: string]: File }>();

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex flex-col space-y-1">
        <label className="text-sm text-amber-50/80">{label}</label>
        <div className="flex items-center border-1 border-amber-50/50 rounded from-black/10 bg-gradient-to-r pr-2 focus-within:border-amber focus-within:ring-2 focus-within:ring-offset-3 focus-within:ring-amber/50 focus-within:ring-offset-transparent">
          <input
            {...props}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              const files = event.currentTarget.files;
              if (files && files.length > 0)
                setFieldValue(props.name, files[0]);
            }}
            className="flex-1 bg-transparent p-2 outline-none placeholder-text-sm placeholder-amber-50/50"
          />
          <div className="rounded bg-white">
            {values[props.name] && (
              <Image
                src={URL.createObjectURL(values[props.name])}
                width={32}
                height={32}
                alt="preview"
              />
            )}
          </div>
        </div>
      </div>
      <small className="text-sm text-red first-letter:capitalize">
        <ErrorMessage name={props.name} />
      </small>
    </div>
  );
}
