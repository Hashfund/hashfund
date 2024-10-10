"use client";

import  type { Mint } from "@hashfund/sdk/models";

import useScreen from "@/composables/useScreen";

import ChartView from "../widgets/ChartView";

type GraphProps = {
  mint: Mint;
};

export function MintInfoGraph({ mint }: GraphProps) {
  const screen = useScreen();

  return (
    screen && (
      <ChartView
        mint={mint.id}
        width={screen!.width}
        height={screen!.height * 0.7}
      />
    )
  );
}
