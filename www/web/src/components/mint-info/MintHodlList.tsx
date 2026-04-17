"use client";

import { useState, useEffect } from "react";
import clsx from "clsx";
import Link from "next/link";
import type { MintWithExtra } from "@hashfund/sdk/models";

import { Explorer } from "@/web3/link";
import { truncateAddress } from "@/web3";
import { normalizeBN } from "@/web3/decimal";
import { useTokenHolders } from "@/composables/useTokenHolders";

import LeaderboardItem from "../LeaderboardItem";
import BubbleMapModal from "./BubbleMapModal";

type MintHoldListProps = {
  mint: MintWithExtra;
  className?: string;
};

export default function MintHoldList({ mint, className }: MintHoldListProps) {
  const [isMapOpen, setIsMapOpen] = useState(false);
  const { holders, loading } = useTokenHolders(mint);
  const supply = normalizeBN(mint.supply, mint.decimals);

  return (
    <div className={clsx(className, "flex flex-col space-y-4")}>
      <div className="flex items-center">
        <div className="flex-1">
          <h1 className="text-lg font-medium">Holder distribution</h1>
        </div>
        <button
          disabled={loading}
          onClick={() => setIsMapOpen(true)}
          className="btn bg-secondary text-sm px-3 py-1.5 hover:brightness-110 transition-all border border-white/5 shadow-lg disabled:opacity-50"
        >
          {loading ? "Fetching..." : "Generate bubble map"}
        </button>

        <BubbleMapModal
          isOpen={isMapOpen}
          onClose={() => setIsMapOpen(false)}
          tokenName={mint.name}
          holders={holders}
          totalSupply={supply}
        />
      </div>

      <div className="flex flex-1 flex-col space-y-3 min-h-[100px]">
        {loading ? (
          <div className="flex flex-1 items-center justify-center animate-pulse text-zinc-500 italic text-sm">
            Fetching holders...
          </div>
        ) : holders.length > 0 ? (
          holders.map((holder, index) => {
            const percentage = (holder.uiAmount! / supply) * 100;
            // The large portion in the curve is the Bonding Curve Supply.
            // The remaining (usually 20%) is Raydium Reserved.
            const displayName = holder.isDev
              ? "Developer"
              : holder.isBoundingCurve || holder.isBoundingCurveReserve
              ? percentage > 50
                ? "Bonding Curve Supply"
                : "Raydium Reserved"
              : truncateAddress(holder.address.toBase58());

            return (
              <Link
                key={holder.address.toBase58()}
                href={Explorer.buildAccount(holder.address.toBase58())}
                target="_blank"
              >
                <LeaderboardItem
                  index={index + 1}
                  user={{
                    id: holder.address.toBase58(),
                    name: displayName,
                    avatar: "",
                  }}
                  amount={percentage.toFixed(1) as any}
                  ticker={"%"}
                />
              </Link>
            );
          })
        ) : (
          <div className="flex flex-1 items-center justify-center text-zinc-500 italic text-sm">
            No holders found.
          </div>
        )}
      </div>
    </div>
  );
}
