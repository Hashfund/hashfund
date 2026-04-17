"use client";
import type { MintWithExtra } from "@hashfund/sdk/models";

import Link from "next/link";
import Image from "next/image";

import { PythFeed } from "@/config/pyth";
import { useFeedPrice } from "@/composables/useFeedPrice";
import { percentageBN, formatPrice, normalizeBN, Explorer } from "@/web3";
import { formatNumberShort } from "@/web3/format";
import { getMintMetrics } from "@/web3/metrics";
import {
  calculateMarketCap,
  calculateBondingProgress,
  deriveCurvePhysics,
  calculateTokenPriceSol,
  calculateRealSol,
  calculateSolToBond,
  calculateRealTokenRemaining,
} from "@/web3/curve";

import { SwapButton } from "../swap";
import ProgressBar from "../ProgressBar";
import SocialList from "./SocialList";

type HeaderProps = {
  mint: MintWithExtra;
};

export function Header({ mint }: HeaderProps) {
  const solPrice = useFeedPrice(PythFeed.SOL_USD);

  if (!mint.boundingCurve) {
    return (
      <header
        className="flex px-4"
        lt-md="flex-col space-y-2"
        md="space-x-4 px-8"
      >
        <div className="flex-1 overflow-hidden space-y-1">
          <div className="flex items-center space-x-2">
            <h1 className="text-3xl font-bold truncate">{mint.name}</h1>
            <span className="text-zinc-500 font-mono text-sm mt-1">
              ({mint.symbol})
            </span>
          </div>
          <p className="font-mono text-xs text-white/40 truncate select-all">
            {mint.id}
          </p>
        </div>
        <div className="flex items-center justify-center p-4 bg-white/2 rounded-xl border border-white/5 animate-pulse">
            Indexing Bonding Curve Data...
        </div>
      </header>
    );
  }

  const metrics = getMintMetrics(mint, solPrice || 1);

  return (
    <header
      className="flex px-4"
      lt-md="flex-col space-y-2"
      md="space-x-4 px-8"
    >
      <div
        className="flex"
        lt-md="items-center space-x-4"
        md="flex-col space-y-4"
      >
        <div>
          <Image
            src={mint.metadata?.image}
            alt={mint.name}
            width={64}
            height={64}
            className="h-12 w-12 rounded"
          />
        </div>
        <SocialList
          mint={mint}
          className="md:hidden"
        />
      </div>
      <div className="flex flex-1 space-x-4">
        <div className="flex flex-1 items-center">
          <div className="flex flex-1 flex-col space-y-2">
            <div>
              <div className="flex items-end space-x-2">
                <p className="text-2xl font-bold">{mint.name}</p>
                <p className="text-lg text-primary font-medium mb-0.5">
                  {formatPrice(metrics.displayPriceUsd)}
                </p>
              </div>
              <small className="text-white/75 line-clamp-2">
                {mint.metadata?.description || "No description available for this hash fund."}
              </small>
            </div>
            <SocialList
              mint={mint}
              className="lt-md:hidden"
            />
            <div
              className="flex text-sm font-light font-sans"
              lt-md="flex-col"
              md="items-center  space-x-2"
            >
              <p>{formatPrice(metrics.marketCapUsd)}</p>
              <ProgressBar
                className="w-48 lt-md:flex-1"
                value={metrics.bondingProgress}
              />
              <p lt-md="self-end">
                {formatPrice(metrics.raydiumTargetUsd)}
              </p>
            </div>
            <div className="max-w-md flex flex-1 flex-col text-xs text-white/75 space-y-2">
              <p>
                When the market cap reaches&nbsp;
                {formatPrice(metrics.raydiumTargetUsd)}
                &nbsp; all the liquidity from the bonding curve will be
                deposited into Raydium and burned. progression increases as the
                price goes up.
              </p>
              <p>
                There are&nbsp;
                {formatNumberShort(calculateRealTokenRemaining(mint))}
                &nbsp;tokens still available for sale in the bonding curve.
              </p>
            </div>
          </div>
        </div>
        <div>
          {mint.boundingCurve.tradeable && <SwapButton mint={mint} />}
          {mint.boundingCurve.migrated && (
            <Link
              href={Explorer.buildRaydium(mint.id)}
              target="_blank"
              className="btn bg-[#908fe7]"
            >
              Trade On Raydium
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
