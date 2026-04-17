"use client";
import { web3 } from "@coral-xyz/anchor";
import { NATIVE_MINT } from "@solana/spl-token";
import type { MintWithExtra } from "@hashfund/sdk/models";

import { useState, useMemo } from "react";
import { Popover, PopoverButton } from "@headlessui/react";

import { normalizeBN } from "@/web3";
import { calculateTokenPriceSol } from "@/web3/curve";
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
      virtualTokenReserve: normalizeBN(
        mint.boundingCurve.virtualTokenBalance,
        mint.decimals
      ),
      virtualPairReserve: normalizeBN(mint.boundingCurve.virtualPairBalance, 9),
    }),
    [solBalance, mint]
  );

  const mintSide = useMemo(
    () => ({
      symbol: mint.symbol,
      decimals: mint.decimals,
      image: mint.metadata.image,
      mint: new web3.PublicKey(mint.id),
      balance: mintBalance?.uiAmount ?? 0,
      virtualTokenReserve: normalizeBN(
        mint.boundingCurve.virtualTokenBalance,
        mint.decimals
      ),
      virtualPairReserve: normalizeBN(mint.boundingCurve.virtualPairBalance, 9),
    }),
    [mintBalance, mint]
  );

  const [side, setSide] = useState<"buy" | "withdraw">("buy");

  return (
    <Popover className="relative flex flex-col space-y-14">
      <PopoverButton className="btn btn-primary outline-none">
        Swap
      </PopoverButton>
      <SwapModal
        isMigrated={mint.boundingCurve.migrated}
        side={side as any}
        sideA={side === "buy" ? solSide : mintSide}
        sideB={side === "buy" ? mintSide : solSide}
        onSwapSide={() => {
          setSide(side === "buy" ? "withdraw" : "buy");
        }}
      />
    </Popover>
  );
}
