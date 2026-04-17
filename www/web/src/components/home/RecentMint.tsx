"use client";

import clsx from "clsx";
import Link from "next/link";
import Image from "next/image";
import type { MintWithExtra } from "@hashfund/sdk/models";
import { MdBolt, MdChevronRight } from "react-icons/md";


import { PythFeed } from "@/config/pyth";
import { formatPrice } from "@/web3/price";
import { getMintMetrics } from "@/web3/metrics";
import { useFeedPrice } from "@/composables/useFeedPrice";

type RecentMintProps = {
  className?: string;
  mints: MintWithExtra[];
};

export function RecentMint({ className, mints }: RecentMintProps) {
  const solPrice = useFeedPrice(PythFeed.SOL_USD);

  return (
    <section
      className={clsx(
        className,
        "flex flex-col space-y-4 border border-dark pb-4 rounded-md"
      )}
    >
      <div className="flex items-center border-b-1 border-dark px-4 py-4 space-x-4">
        <div className="flex flex-1 items-center space-x-2">
          <MdBolt className="text-2xl" />
          <p className="text-base font-medium">Recently Mint</p>
        </div>
        <div>
          <Link
            href="/create"
            className="p-2 text-primary"
          >
            Mint Token
          </Link>
        </div>
      </div>
      {mints && mints.length > 0 ? (
        <div className="flex flex-col divide-y divide-dark">
          {mints.map((mint) => {
            const metrics = getMintMetrics(mint, solPrice || 1);
            return (
              <Link
                key={mint.id}
                href={mint.id}
                className="flex flex-col px-4 py-3 hover:bg-dark-light transition-colors"
              >
                <div className="flex items-center space-x-2 mb-2">
                  <div className="flex flex-1 items-center space-x-2">
                    <Image
                      src={mint.metadata?.image || ""}
                      alt={mint.name}
                      width={48}
                      height={48}
                      className="h-9 w-9 rounded-md"
                    />
                    <div className="flex flex-col overflow-hidden">
                      <p className="font-medium truncate">{mint.name}</p>
                      <p className="text-[11px] text-white/50">{formatPrice(metrics.marketCapUsd)} MC</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <p className="text-xs font-mono font-bold text-primary">
                      {formatPrice(metrics.displayPriceUsd)}
                    </p>
                    <div className="flex items-center space-x-1">
                       <span className="text-[10px] text-white/40">{metrics.bondingProgress.toFixed(0)}%</span>
                       <div className="w-12 h-1 bg-dark rounded-full overflow-hidden">
                          <div className="h-full bg-primary" style={{ width: `${metrics.bondingProgress}%` }} />
                       </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-1 flex-col self-center justify-center text-center space-y-2">
          <p>No token mint yet</p>
          <Link
            href="/create"
            className="btn btn-primary"
          >
            Create
          </Link>
        </div>
      )}
    </section>
  );
}
