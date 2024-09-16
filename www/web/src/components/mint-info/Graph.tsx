"use client";
import { Mint } from "@/lib/api/models";

import ChartView from "../widgets/ChartView";
import useScreen from "@/composables/useScreen";

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
