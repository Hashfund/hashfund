"use client";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";

import { Id, toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { TabGroup, TabList, TabPanels } from "@headlessui/react";

import {
  MintInitialBuyAmountForm,
  MintMaximumMarketCapForm,
  MintMetadataForm,
  processForm,
} from "@/form/MintForm";
import BalanceProvider from "@/providers/BalanceProvider";
import StepButton from "@/components/widgets/StepButton";
import CreateFormMetadata from "@/components/create/CreateFormMetadata";
import CreateFormMarketCap from "@/components/create/CreateFormMarketCap";
import CreateFormDeposit from "@/components/create/CreateFormDeposit";
import TransactionToast from "@/components/TransactionToast";

export default function CreatePage() {
  const router = useRouter();

  const walletState = useWallet();
  const { connection } = useConnection();

  const [tabIndex, setTabIndex] = useState(0);
  const [formMetadata, setFormMetadata] = useState<MintMetadataForm>({
    name: "",
    symbol: "",
    image: "" as unknown as File,
    description: "",
    website: "",
    telegram: "",
    twitter: "",
  });
  const [formMaxMarketCap, setFormMaxMarketCap] =
    useState<MintMaximumMarketCapForm>({
      totalSupply: "" as unknown as number,
      maximumMarketCap: "" as unknown as number,
      maximumMarketCapPc: "" as unknown as number,
      liquidityPercentage: "" as unknown as number
    });
  const [formInitialBuyAmount, setFormInitialBuyAmount] =
    useState<MintInitialBuyAmountForm>({
      initialBuyAmount: "" as unknown as number,
      initialBuyAmountPc: "" as unknown as number,
    });

  const [formResult, setFormResult] = useState<[Id, string, string] | null>(
    null
  );
  const processTx = async () => {
    const toastId = toast.loading("Sending transaction", {
      theme: "dark",
      autoClose: false,
    });
    try {
      const [mint, signature] = await processForm(
        connection,
        walletState,
        formMetadata,
        formMaxMarketCap,
        formInitialBuyAmount
      );
      setFormResult([toastId, mint, signature]);
    } catch (error: any) {
      toast.update(toastId, {
        isLoading: false,
        type: "error",
        render: error.message,
        autoClose: 5000,
      });
    }
  };

  useEffect(() => {
    if (formInitialBuyAmount.initialBuyAmount) processTx();
  }, [formInitialBuyAmount]);

  return (
    <>
      <TabGroup
        selectedIndex={tabIndex}
        onChange={(index) => {
          if (index < tabIndex) {
            setTabIndex(index);
          }
        }}
        className="flex flex-1 flex-col lg:flex-row md:justify-center lt-md:px-4 md:px-8 lg:space-x-4 lt-lg:space-y-8"
      >
        <TabList className="flex lg:w-sm lg:flex-col lg:justify-center lt-lg:space-x-2">
          <StepButton
            position="1"
            title="Token Metdata"
          />
          <StepButton
            position="2"
            title="Set maximum market cap & range"
          />
          <StepButton
            position="3"
            title="Enter deposit amount"
            hideLine
          />
        </TabList>
        <BalanceProvider>
          <TabPanels className="h-full flex flex-col lg:w-xl">
            <CreateFormMetadata
              form={formMetadata}
              onSubmit={(value) => {
                setFormMetadata(value);
                setTabIndex(tabIndex + 1);
              }}
            />
            <CreateFormMarketCap
              ticker={formMetadata.symbol}
              form={formMaxMarketCap}
              onSubmit={(value) => {
                setFormMaxMarketCap(value);
                setTabIndex(tabIndex + 1);
              }}
            />
            <CreateFormDeposit
              mint={formMetadata}
              maximumMarketcap={formMaxMarketCap}
              ticker={formMetadata.symbol}
              form={formInitialBuyAmount}
              onSubmit={async (value) => {
                setFormInitialBuyAmount(value);
              }}
            />
          </TabPanels>
        </BalanceProvider>
      </TabGroup>
      {formResult && (
        <TransactionToast
          toastId={formResult[0]}
          signature={formResult[2]}
          callback={(status) => {
            if (status === "confirmed") {
              router.push("/" + formResult[1]);
            }
          }}
        />
      )}
    </>
  );
}
