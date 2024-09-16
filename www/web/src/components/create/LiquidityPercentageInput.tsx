import clsx from "clsx";
import { Field, ErrorMessage, useFormikContext } from "formik";

export default function LiquidityPercentageInput() {
  const { setFieldValue, values } = useFormikContext<{
    liquidityPercentage: number;
  }>();

  return (
    <>
      <Field
        type="number"
        name="liquidityPercentage"
        className="rounded bg-dark-800 p-3"
        placeholder="Token Liquidity Percentage"
      />
      <div className="flex items-center space-x-4">
        {Array.from({ length: 5 }).map((_, index) => {
          const percentage = (index + 1) * 5;
          const selected = Number(values.liquidityPercentage) === percentage;

          return (
            <button
              key={index}
              type="button"
              className={clsx(
                "px-4 py-1 rounded-full text-xs",
                selected ? "bg-white text-black" : "bg-white/20 text-white"
              )}
              onClick={() => setFieldValue("liquidityPercentage", percentage)}
            >
              {percentage}%
            </button>
          );
        })}
      </div>
      <small className="text-xs text-red">
        <ErrorMessage name="tokenSupply" />
      </small>
    </>
  );
}
