"use client";
import { NATIVE_MINT } from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";

import { useState, useMemo } from "react";
import { Popover, PopoverButton } from "@headlessui/react";

import SwapModal from "./Modal";
import { Mint } from "@/lib/api/models";
import useBalance from "@/composables/useBalance";

type SwapButtonProps = {
  mint: Mint;
};

export function SwapButton({ mint }: SwapButtonProps) {
  const { solBalance, mintBalance } = useBalance();

  const solSide = useMemo(
    () => ({
      mint: NATIVE_MINT,
      balance: solBalance / 1_000_000_000,
      decimals: 9,
      ticker: "SOL",
      image: "/sol.png",
      initialPrice: mint.boundingCurve.initialPrice,
    }),
    [solBalance]
  );

  const mintSide = useMemo(
    () => ({
      mint: new PublicKey(mint.id),
      balance: mintBalance?.uiAmount ?? 0,
      decimals: mintBalance?.decimals ?? 6,
      ticker: mint.ticker,
      image: mint.metadata?.image,
      initialPrice: mint.boundingCurve.initialPrice,
    }),
    [mintBalance]
  );

  const [side, setSide] = useState<"buy" | "sell">("buy");

  return (
    <Popover className="relative flex flex-col space-y-14">
      <PopoverButton className="btn btn-primary outline-none">
        Swap
      </PopoverButton>
      <SwapModal
        side={side}
        sideA={side === "buy" ? solSide : mintSide}
        sideB={side === "buy" ? mintSide : solSide}
        onSwapSide={() => {
          setSide(side === "buy" ? "sell" : "buy");
        }}
      />
    </Popover>
  );
}
