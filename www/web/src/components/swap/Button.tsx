"use client";
import type { MintWithExtra } from "@hashfund/sdk/models";
import { PublicKey } from "@solana/web3.js";
import { NATIVE_MINT } from "@solana/spl-token";

import { useState, useMemo } from "react";
import { Popover, PopoverButton } from "@headlessui/react";

import { normalizeBN } from "@/web3";
import useBalance from "@/composables/useBalance";

import SwapModal from "./Modal";

type SwapButtonProps = {
  mint: MintWithExtra;
};

export function SwapButton({ mint }: SwapButtonProps) {
  const { solBalance, mintBalance } = useBalance();

  const solSide = useMemo(
    () => ({
      mint: NATIVE_MINT,
      decimals: 9,
      symbol: "SOL",
      image: "/sol.png",
      balance: normalizeBN(solBalance, 9),
      initialPrice: mint.boundingCurve.initialPrice,
    }),
    [solBalance]
  );

  const mintSide = useMemo(
    () => ({
      symbol: mint.symbol,
      decimals: mint.decimals,
      image: mint.metadata.image,
      mint: new PublicKey(mint.id),
      balance: mintBalance?.uiAmount ?? 0,
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
