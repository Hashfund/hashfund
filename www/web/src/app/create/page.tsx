"use client";
import { useState } from "react";
import { type Id, toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { TabGroup, TabList, TabPanels } from "@headlessui/react";

import BalanceProvider from "@/providers/BalanceProvider";
import { processMetadataForm, type MetadataForm } from "@/form/MetadataForm";
import {
  type MintInitialBuyForm,
  type MintSupplyForm,
  processMintForm,
} from "@/form/MintForm";

import { useSDK } from "@/composables/useSDK";
import { useProgram } from "@/composables/useProgram";
import StepButton from "@/components/widgets/StepButton";
import TransactionToast from "@/components/TransactionToast";
import CreateFormMintSupply from "@/components/create/CreateFormMintSupply";
import CreateFormMetadata from "@/components/create/CreateFormMetadata";
import CreateFormInitialBuy from "@/components/create/CreateFormInitialBuy";

const Toast = ({ result }: { result: [Id, string, string] }) => {
  const router = useRouter();
  const [toastId, mint, signature] = result;

  return (
    <TransactionToast
      toastId={toastId}
      signature={signature}
      callback={(status) => {
        if (status === "confirmed") router.push("/" + mint);
      }}
    />
  );
};

export default function CreatePage() {
  const { api } = useSDK();
  const { program } = useProgram();

  const [tabIndex, setTabIndex] = useState(0);
  const [formMetadata, setFormMetadata] = useState<MetadataForm>({
    uri: "",
    name: "",
    symbol: "",
    description: "",
    website: "",
    telegram: "",
    twitter: "",
    decimals: 6,
    image: undefined as unknown as File,
  });
  const [formMintSupply, setFormMintSupply] = useState<MintSupplyForm>({
    supply: 0,
    liquidityPercentage: 0,
  });
  const [formInitialBuy, setFormInitialBuy] = useState<MintInitialBuyForm>({
    pairAmount: 0,
    tokenAmount: 0,
  });

  const [result, setResult] = useState<[Id, string, string] | null>(null);
  const processTx = async (lazyFormInitialBuy: MintInitialBuyForm) => {
    const toastId = toast.loading("Sending transaction", {
      theme: "dark",
      autoClose: false,
    });
    try {
      const [mint, signature] = await processMintForm(
        program,
        formMetadata,
        formMintSupply,
        lazyFormInitialBuy
      );
      setResult([toastId, mint.toBase58(), signature]);
    } catch (error) {
      if (error instanceof Error)
        toast.update(toastId, {
          type: "error",
          autoClose: 5000,
          isLoading: false,
          render: error.message,
        });
    }
  };

  return (
    <>
      <TabGroup
        selectedIndex={tabIndex}
        onChange={(index) => {
          if (index < tabIndex) setTabIndex(index);
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
              onSubmit={async (value) => {
                return processMetadataForm(program, api, value).then((uri) => {
                  setFormMetadata(Object.assign(value, {uri}));
                  setTabIndex(tabIndex + 1);
                });
              }}
            />

            <CreateFormMintSupply
              form={formMintSupply}
              onSubmit={(value) => {
                setFormMintSupply(value);
                setTabIndex(tabIndex + 1);
              }}
            />
            <CreateFormInitialBuy
              form={formInitialBuy}
              metadataForm={formMetadata}
              mintSupplyForm={formMintSupply}
              onSubmit={async (value) => {
                setFormInitialBuy(value);
                return processTx(value);
              }}
            />
          </TabPanels>
        </BalanceProvider>
      </TabGroup>
      {result && <Toast result={result} />}
    </>
  );
}
