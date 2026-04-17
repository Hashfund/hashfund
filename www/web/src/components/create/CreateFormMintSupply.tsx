"use client";

import { useMemo, useState } from "react";
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

const PUMP_STRENGTH_OPTIONS = [
  {
    label: "Degen Mode",
    value: 50,
    targetSolToGraduate: 55,
    subtext: "Fewer tokens in the curve, faster early price movement, lower capital required.",
    selectedClass:
      "border-rose-400/70 bg-rose-500/10 shadow-[0_0_0_1px_rgba(251,113,133,0.35)]",
    badgeClass: "bg-rose-400/15 text-rose-300 border border-rose-400/30",
  },
  {
    label: "Momentum",
    value: 70,
    targetSolToGraduate: 75,
    subtext: "Balanced curve depth, solid early movement, moderate capital required.",
    selectedClass:
      "border-amber-400/70 bg-amber-500/10 shadow-[0_0_0_1px_rgba(251,191,36,0.35)]",
    badgeClass: "bg-amber-400/15 text-amber-300 border border-amber-400/30",
  },
  {
    label: "Standard",
    value: 80,
    targetSolToGraduate: 85,
    subtext: "Deeper curve, slower early movement, stronger sustained growth potential.",
    selectedClass:
      "border-sky-400/70 bg-sky-500/10 shadow-[0_0_0_1px_rgba(56,189,248,0.35)]",
    badgeClass: "bg-sky-400/15 text-sky-300 border border-sky-400/30",
  },
  {
    label: "Max Runway",
    value: 90,
    targetSolToGraduate: 100,
    subtext: "Deepest curve, slowest early movement, largest total expansion potential.",
    selectedClass:
      "border-indigo-400/70 bg-indigo-500/10 shadow-[0_0_0_1px_rgba(99,102,241,0.35)]",
    badgeClass: "bg-indigo-400/15 text-indigo-300 border border-indigo-400/30",
  },
];

export default function CreateFormMintSupply({ form, onSubmit }: Props) {
  const { config } = useProgram();
  const solPrice = useFeedPrice(PythFeed.SOL_USD);
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <TabPanel className="space-y-6">
      <div className="space-y-2">
        <div className="inline-flex items-center rounded-full border border-zinc-800 bg-zinc-900/80 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-zinc-400">
          Launch Setup
        </div>

        <h2 className="text-2xl font-semibold text-white sm:text-3xl">
          Bonding Curve Settings
        </h2>

        <p className="max-w-2xl text-sm leading-6 text-zinc-400">
          Set your token supply and choose how aggressively the bonding curve
          moves during early buying.
        </p>
      </div>

      {config && (
        <Formik
          initialValues={{
            ...form,
            liquidityPercentage:
              form.liquidityPercentage &&
              [50, 70, 80, 90].includes(form.liquidityPercentage)
                ? form.liquidityPercentage
                : 80,
          }}
          validationSchema={validateMintSupplySchema}
          onSubmit={(values, { setSubmitting }) => {
            onSubmit(values);
            setSubmitting(false);
          }}
        >
          {({ values, isSubmitting, setFieldValue }) => {
            const solPriceSafe = solPrice > 0 ? solPrice : 1;
            const targetSol = PUMP_STRENGTH_OPTIONS.find(o => o.value === values.liquidityPercentage)?.targetSolToGraduate || 85;

            const curve = useMemo(
              () =>
                new ConstantCurveCalculator(
                  unsafeBN(
                    safeBN(values.supply).mul(new BN(10).pow(new BN(6)))
                  ),
                  values.liquidityPercentage
                ),
              [values]
            );

            return (
              <Form className="space-y-8">
                <div className="rounded-3xl border border-zinc-800 bg-gradient-to-b from-zinc-900 to-zinc-950 p-5 sm:p-6">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="block text-sm font-medium text-zinc-200">
                        Token Supply
                      </label>
                      <span className="text-[10px] text-primary/70 font-mono">
                        Max: 18 Trillion (u64)
                      </span>
                    </div>

                    <Field
                      name="supply"
                      type="number"
                      className="w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-white/40"
                      placeholder="Standard: 1,000,000,000"
                    />

                    <div className="flex flex-col space-y-1">
                      <ErrorMessage
                        name="supply"
                        component="div"
                        className="text-sm text-red-400"
                      />
                      {values.supply > 1_000_000_000_000 && (
                        <p className="text-[10px] text-amber-400/80">
                          ⚠️ Extreme supply detected. Ensure you've calculated
                          your bonding target correctly. 1B is standard.
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl border border-zinc-800 bg-gradient-to-b from-zinc-900 to-zinc-950 p-5 sm:p-6">
                  <div className="mb-6">
                    <h3 className="mt-1 text-2xl font-bold text-white">
                      Set Bonding Curve
                    </h3>
                    <p className="mt-1 text-sm text-zinc-400">
                      Configure how your token reacts to buying pressure.
                    </p>
                  </div>

                  <div className="relative mb-4 flex items-center gap-3">
                    <div>
                      <div className="text-sm font-medium text-zinc-200">
                        Pump Strength
                      </div>
                      <div className="mt-1 text-xs text-zinc-500">
                        Choose how aggressive your launch curve feels.
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowTooltip((prev) => !prev)}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900 text-sm font-semibold text-zinc-300 transition hover:border-zinc-500 hover:text-white"
                    >
                      ?
                    </button>

                    {showTooltip && (
                      <div className="absolute left-0 top-14 z-20 w-full max-w-lg rounded-2xl border border-zinc-700 bg-zinc-950/95 p-5 shadow-2xl backdrop-blur">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="text-base font-semibold text-white">
                              How this affects your launch
                            </div>
                            <div className="mt-1 text-sm text-zinc-400">
                              Bonding Curve controls how much of your token supply is placed into the curve and how price reacts as users buy.
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => setShowTooltip(false)}
                            className="inline-flex h-8 min-w-8 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900 px-3 text-xs font-medium text-zinc-300 transition hover:border-zinc-500 hover:text-white"
                          >
                            Close
                          </button>
                        </div>

                        <div className="mt-4 space-y-3 text-sm leading-6 text-zinc-300">
                          <p>
                            • Lower percentages place fewer tokens into the curve, increasing early price sensitivity.
                          </p>
                          <p>
                            • Higher percentages lower early price sensitivity, requiring more capital but creating a longer / stronger overall run.
                          </p>
                          <p className="border-l-2 border-red-500/50 pl-3">
                            <span className="font-semibold text-white">Pre-bond Mechanics:</span> Before bond, only buys move the curve upward. Withdrawals <b>burn/cancel</b> your allocation and do <b>not</b> move the curve or price. Pre-bond gains cannot be realized!
                          </p>
                        </div>

                        <div className="mt-5 flex flex-col gap-3">
                          <div className="rounded-xl border border-rose-400/20 bg-rose-500/5 px-3 py-3 text-sm text-rose-200">
                            <div className="flex justify-between font-semibold"><span>50% — Degen Mode</span></div>
                            <div className="mt-1 text-xs leading-5 text-rose-300/80">
                              Fewer tokens in the curve, faster early price movement, lower capital required, shorter total runway.
                            </div>
                          </div>
                          
                          <div className="rounded-xl border border-amber-400/20 bg-amber-500/5 px-3 py-3 text-sm text-amber-200">
                            <div className="flex justify-between font-semibold"><span>70% — Momentum</span></div>
                            <div className="mt-1 text-xs leading-5 text-amber-300/80">
                              Balanced curve depth, solid early movement, moderate capital required, good overall launch behavior.
                            </div>
                          </div>

                          <div className="rounded-xl border border-sky-400/20 bg-sky-500/5 px-3 py-3 text-sm text-sky-200">
                            <div className="flex justify-between font-semibold"><span>80% — Standard</span></div>
                            <div className="mt-1 text-xs leading-5 text-sky-300/80">
                              Deeper curve, slower early movement, higher capital required, stronger sustained growth potential.
                            </div>
                          </div>

                          <div className="rounded-xl border border-indigo-400/20 bg-indigo-500/5 px-3 py-3 text-sm text-indigo-200">
                            <div className="flex justify-between font-semibold"><span>90% — Max Runway</span></div>
                            <div className="mt-1 text-xs leading-5 text-indigo-300/80">
                              Deepest curve, slowest early movement, highest capital required, largest total expansion potential.
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {PUMP_STRENGTH_OPTIONS.map((option) => {
                      const isSelected =
                        values.liquidityPercentage === option.value;

                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() =>
                            setFieldValue(
                              "liquidityPercentage",
                              option.value
                            )
                          }
                          className={`rounded-2xl border p-4 text-left transition duration-200 ${
                            isSelected
                              ? `${option.selectedClass} text-white`
                              : "border-zinc-700 bg-zinc-950 text-zinc-300 hover:border-zinc-500 hover:bg-zinc-900"
                          }`}
                        >
                          <div className="flex flex-col items-center justify-center gap-2">
                            <div>
                              <div className="text-base font-semibold text-center">
                                {option.label}
                              </div>
                            </div>

                            <div
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                isSelected
                                  ? option.badgeClass
                                  : "border border-zinc-700 bg-zinc-900 text-zinc-400"
                              }`}
                            >
                              {option.value}%
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="hidden">
                    <Field
                      name="liquidityPercentage"
                      component={PercentageInput}
                    />
                  </div>

                  <ErrorMessage
                    name="liquidityPercentage"
                    component="div"
                    className="mt-3 text-sm text-red-400"
                  />
                </div>

                <MintCurveInfo curve={curve} solPrice={solPrice} />

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-2xl bg-white px-5 py-3 font-medium text-black transition hover:opacity-90 disabled:opacity-50"
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