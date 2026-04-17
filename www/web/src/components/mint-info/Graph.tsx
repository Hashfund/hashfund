"use client";

import  type { Mint } from "@hashfund/sdk/models";

import useScreen from "@/composables/useScreen";

import dynamic from "next/dynamic";

const ChartView = dynamic(() => import("../widgets/ChartView"), {
  ssr: false,
});

type GraphProps = {
  mint: Mint;
};

import { useState, useEffect } from "react";

export function MintInfoGraph({ mint }: GraphProps) {
  const screen = useScreen();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted || !screen) return null;

  return (
    <ChartView
      mint={mint.id}
      width={screen.width}
      height={screen.height * 0.7}
    />
  );
}
