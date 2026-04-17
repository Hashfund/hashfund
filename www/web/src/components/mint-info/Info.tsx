"use client";

import Link from "next/link";
import type { Mint, MintWithExtra } from "@hashfund/sdk/models";

import { Explorer } from "@/web3/link";
import { PythFeed } from "@/config/pyth";
import { formatPrice } from "@/web3/price";
import { normalizeBN } from "@/web3/decimal";
import { truncateAddress } from "@/web3/address";

import { useFeedPrice } from "@/composables/useFeedPrice";
import { formatNumberShort } from "@/web3/format";
import {
  calculateMarketCap,
  calculateTokenPriceSol,
  deriveCurvePhysics,
  calculateRealSol,
  calculateSolToBond,
  calculateRealTokenRemaining,
} from "@/web3/curve";

import { getMintMetrics } from "@/web3/metrics";

type InfoProps = {
  mint: MintWithExtra;
};

export function Info({ mint }: InfoProps) {
  const solPrice = useFeedPrice(PythFeed.SOL_USD);
  const metrics = getMintMetrics(mint, solPrice || 1);

  return (
    <section
      className="flex flex-col px-4"
      md="px-8"
    >
      <div>
        <h1 className="text-xl font-medium">Hash Info</h1>
        <p className="text-sm text-white/50 mt-1 italic">
          {mint.metadata?.description || "No description available for this hash fund."}
        </p>
      </div>
      <div
        className="flex"
        lt-md="flex-col"
        md="space-x-4"
      >
        <div className="flex-1">
          {mint.boundingCurve ? (
            <>
              <div className="flex py-4 font-medium">
                <p className="flex-1 text-white/75 underline underline-dashed">
                  Graduation Marketcap
                </p>
                <p>{formatPrice(metrics.raydiumTargetUsd)}</p>
              </div>
              <div className="flex py-4 font-medium border-b border-white/5">
                <p className="flex-1 text-white/75 underline underline-dashed">
                  Current Marketcap
                </p>
                <p className="text-primary font-bold">{formatPrice(metrics.marketCapUsd)}</p>
              </div>

              <div className="flex py-4 font-medium">
                <p className="flex-1 text-white/75 underline underline-dashed">
                  SOL Raised
                </p>
                <p className="sol">{metrics.solRaised.toFixed(2)}</p>
              </div>
              <div className="flex py-4 font-medium">
                <p className="flex-1 text-white/75 underline underline-dashed">
                  SOL Needed to Bond
                </p>
                <p className="sol text-primary">
                  {(metrics.solRequired - metrics.solRaised).toFixed(2)}
                </p>
              </div>
              <div className="flex py-2 px-2 rounded bg-white/5 text-[10px] space-x-4 mb-2">
                 <p><span className="text-white/50">Migration Target:</span> {metrics.solRequired.toFixed(2)} SOL</p>
                 <p><span className="text-white/50">Completion:</span> {metrics.bondingProgress.toFixed(1)}%</p>
              </div>
              <div className="flex py-4 font-medium border-t border-white/5 mt-2">
                <p className="flex-1 text-white/75 underline underline-dashed">
                  Tokens Remaining
                </p>
                <p className="text-white">
                  {formatNumberShort(calculateRealTokenRemaining(mint))}
                </p>
              </div>
              <div className="flex py-4 border-y border-white/5 bg-white/2 my-2">
                <p className="flex-1 text-white/75 font-medium">Token Price</p>
                <p className="text-primary font-bold">
                  {formatPrice(metrics.displayPriceUsd)}
                </p>
              </div>
            </>
          ) : (
            <div className="py-10 text-center text-zinc-500 italic text-sm animate-pulse">
              Crunching curve physics...
            </div>
          )}
          <div className="flex py-2 font-medium">
            <p className="flex-1 text-white/75 text-xs">Total Supply</p>
            <p className="text-xs">
              {formatNumberShort(metrics.nominalSupply)}&nbsp;{mint.symbol}
            </p>
          </div>
        </div>
        <div className="flex-1">
          <div className="flex py-4">
            <p className="flex-1 text-white/75 underline underline-dashed">
              Contract Address
            </p>
            <Link
              href={Explorer.buildAccount(mint.id)}
              target="_blank"
            >
              <small>{truncateAddress(mint.id)}</small>
            </Link>
          </div>
          <div className="flex py-4">
            <p className="flex-1 text-white/75 underline underline-dashed">
              Developer
            </p>
            <Link
              href={Explorer.buildAccount(mint.creator)}
              target="_blank"
            >
              <small>{truncateAddress(mint.creator)}</small>
            </Link>
          </div>
          <div className="flex py-4">
            <p className="flex-1 text-white/75 underline underline-dashed">
              Bonding curve
            </p>
            <Link
              href={Explorer.buildAccount(mint.boundingCurve?.id)}
              target="_blank"
            >
              <small>{truncateAddress(mint.boundingCurve?.id)}</small>
            </Link>
          </div>
          <div className="flex py-4">
            <p className="flex-1 text-white/75 underline underline-dashed">
              Signature
            </p>
            <Link
              href={Explorer.buildTx(mint.signature)}
              target="_blank"
            >
              <small>{truncateAddress(mint.signature)}</small>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
