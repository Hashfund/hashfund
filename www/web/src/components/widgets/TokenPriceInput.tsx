import clsx from "clsx";
import Image from "next/image";
import { Field, useFormik, useFormikContext } from "formik";

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
  const { setFieldValue, values } = useFormikContext<{
    [key: string]: any;
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
        <input
          name={name}
          value={values[name] === 0 || values[name] == null || Number.isNaN(values[name]) ? "" : values[name]}
          placeholder="0.00"
          type="number"
          step="any"
          className="flex-1 py-4 text-xl bg-transparent outline-none focus:ring-0"
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            let rawValue = event.target.value;
            
            // Remove leading zeroes if not typing a decimal
            if (rawValue.length > 1 && rawValue.startsWith("0") && !rawValue.startsWith("0.")) {
              rawValue = rawValue.replace(/^0+/, "");
              if (rawValue === "") rawValue = "0";
            }

            setFieldValue(name, rawValue);
            if (onChange) onChange(Number(rawValue));
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
