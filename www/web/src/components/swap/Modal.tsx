"use client";
import { PublicKey } from "@solana/web3.js";
import { ConstantCurveCalculator, TradeDirection } from "@hashfund/zeroboost";

import { useState } from "react";
import { Id, toast } from "react-toastify";
import { MdArrowDownward } from "react-icons/md";
import { PopoverPanel } from "@headlessui/react";

import { Formik, Form, ErrorMessage } from "formik";

import { processSellForm } from "@/form/SellForm";
import { denormalizeBN, normalizeBN } from "@/web3";
import { useProgram } from "@/composables/useProgram";
import { createValidationSchema, processBuyForm } from "@/form/BuyForm";

import TransactionToast from "../TransactionToast";
import TokenPriceInput from "../widgets/TokenPriceInput";

type Side = {
  mint: PublicKey;
  balance: number;
  symbol: string;
  image: string;
  decimals: number;
  initialPrice: number;
};

type SwapModalProps = {
  side: "buy" | "sell";
  sideA: Side;
  sideB: Side;
  onSwapSide: () => void;
};

export default function SwapModal({
  side,
  sideA,
  sideB,
  onSwapSide,
}: SwapModalProps) {
  const { program } = useProgram();
  const validationSchema = createValidationSchema(sideA.balance);
  const [formResult, setFormResult] = useState<[Id, string] | null>(null);

  const processForm = async (buyAmount: string, sellAmount: string) => {
    const toastId = toast.loading("Sending transaction", {
      theme: "dark",
      autoClose: false,
    });

    try {
      let signature =
        side === "buy"
          ? await processBuyForm(
              program,
              sideB.mint,
              Number.parseFloat(buyAmount)
            )
          : await processSellForm(
              program,
              sideA.mint,
              Number.parseFloat(sellAmount),
              sideA.decimals
            );
      setFormResult([toastId, signature]);
    } catch (error: any) {
      toast.update(toastId, {
        isLoading: false,
        type: "error",
        render: error.message,
        autoClose: 5000,
      });
    }
  };

  return (
    <>
      <PopoverPanel
        className="absolute z-1000 flex flex-col rounded bg-dark-900 p-4 backdrop-blur-3xl space-y-4"
        lt-md="right-2 max-w-sm"
        md="right-8"
      >
        <Formik
          validationSchema={validationSchema}
          initialValues={{
            buyAmount: "",
            sellAmount: "",
          }}
          onSubmit={({ buyAmount, sellAmount }, { setSubmitting }) => {
            processForm(buyAmount, sellAmount).finally(() =>
              setSubmitting(false)
            );
          }}
        >
          {({ values, errors, setFieldValue, isSubmitting }) => (
            <Form
              autoComplete="off"
              className="flex flex-col space-y-8"
            >
              <div className="flex flex-col space-y-4">
                <div className="flex flex-col rounded-md bg-dark-500/50 p-4 space-y-2">
                  <div className="flex text-xs text-white/75">
                    <p className="flex-1">Sell</p>
                    <p>Wallet: {sideA.balance.toFixed(4)}</p>
                  </div>
                  <TokenPriceInput
                    name="buyAmount"
                    image={sideA.image}
                    ticker={sideA.symbol}
                    balance={sideA.balance}
                    onChange={(value) => {
                      switch (side) {
                        case "buy":
                          const tokenAmount = normalizeBN(
                            ConstantCurveCalculator.calculateAmountOut(
                              sideA.initialPrice,
                              denormalizeBN(value, sideA.decimals),
                              TradeDirection.BtoA
                            ),
                            sideB.decimals
                          );
                          setFieldValue("sellAmount", tokenAmount);
                          break;
                        case "sell":
                          const pairAmount = normalizeBN(
                            ConstantCurveCalculator.calculateAmountOut(
                              sideA.initialPrice,
                              denormalizeBN(value, sideA.decimals),
                              TradeDirection.AtoB
                            ),
                            sideB.decimals
                          );

                          setFieldValue("sellAmount", pairAmount);
                          break;
                      }
                    }}
                  />
                  <small className="text-red first-letter:uppercase">
                    <ErrorMessage name="buyAmount" />
                  </small>
                </div>
                <button
                  type="button"
                  className="self-center border border-white/50 rounded-full p-2 text-white/50"
                  onClick={onSwapSide}
                >
                  <MdArrowDownward />
                </button>
                <div className="flex flex-col rounded-md bg-dark-500/50 p-4 space-y-2">
                  <div className="flex text-xs text-white/75">
                    <p className="flex-1">Buy</p>
                  </div>
                  <TokenPriceInput
                    name="sellAmount"
                    image={sideB.image}
                    ticker={sideB.symbol}
                    onChange={(value) => {
                      switch (side) {
                        case "buy":
                          const pairAmount = normalizeBN(
                            ConstantCurveCalculator.calculateAmountOut(
                              sideB.initialPrice,
                              denormalizeBN(value, sideB.decimals),
                              TradeDirection.AtoB
                            ),
                            sideA.decimals
                          );
                          setFieldValue("buyAmount", pairAmount);
                          break;
                        case "sell":
                          const tokenAmount = normalizeBN(
                            ConstantCurveCalculator.calculateAmountOut(
                              sideB.initialPrice,
                              denormalizeBN(value, sideB.decimals),
                              TradeDirection.BtoA
                            ),
                            sideA.decimals
                          );
                          setFieldValue("buyAmount", tokenAmount);
                      }
                    }}
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary"
              >
                {isSubmitting ? (
                  <div className="h-6 w-6 animate-spin border-2 border-black border-t-transparent rounded-full" />
                ) : (
                  <span>Proceed</span>
                )}
              </button>
            </Form>
          )}
        </Formik>
      </PopoverPanel>
      {formResult && (
        <TransactionToast
          toastId={formResult[0]}
          signature={formResult[1]}
        />
      )}
    </>
  );
}
