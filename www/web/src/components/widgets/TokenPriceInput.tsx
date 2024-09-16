import clsx from "clsx";
import { Field, useFormik, useFormikContext } from "formik";
import Image from "next/image";

type TokenPriceInputProps = {
  name: string;
  image: string;
  ticker: string;
  balance?: number;
  onChange?: (value: number) => void;
};

export default function TokenPriceInput({
  name,
  image,
  ticker,
  balance,
  onChange,
}: TokenPriceInputProps) {
  const { setFieldValue } = useFormikContext<{
    [key: string]: number;
  }>();
  return (
    <div
      className={clsx("flex space-x-2 bg-dark-900 px-4 rounded", {
        "space-x-8": balance !== undefined,
      })}
    >
      <div className="flex items-center pr-2 space-x-2">
        <Image
          src={image}
          alt={ticker}
          width={24}
          height={24}
          className="h-8 w-8 border-1 border-dark-100 rounded-full bg-black"
        />
        <h4>{ticker}</h4>
      </div>
      <div className="flex flex-1 items-center space-x-2">
        <Field
          name={name}
          placeholder="0.00"
          type="number"
          className="flex-1 py-4 text-xl"
          lt-md="max-w-42"
          md="flex-1 text-right"
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            const value = event.target.value;
            setFieldValue(name, value);
            if (onChange) onChange(Number(value));
          }}
        />
        {balance !== undefined && (
          <button
            type="button"
            className="rounded-md bg-primary/10 px-2 py-1 text-sm text-primary"
            onClick={() => {
              setFieldValue(name, balance);
              if (onChange) onChange(balance);
            }}
          >
            MAX
          </button>
        )}
      </div>
    </div>
  );
}
