"use client";

import Link from "next/link";

import { Explorer } from "@/web3/link";
import { PythFeed } from "@/config/pyth";
import { formatPrice } from "@/web3/price";
import { normalizeBN } from "@/web3/decimal";
import { truncateAddress } from "@/web3/address";

import { Mint } from "@/lib/api/models";
import useFeedPrice from "@/lib/api/useFeedPrice";
import { toUiAmount } from "@/web3/math";

type InfoProps = {
  mint: Mint;
};

export function Info({ mint }: InfoProps) {
  const solPrice = useFeedPrice(PythFeed.SOL_USD);

  return (
    <section
      className="flex flex-col px-4"
      md="px-8"
    >
      <div>
        <h1 className="text-xl font-medium">Hash Info</h1>
      </div>
      <div
        className="flex"
        lt-md="flex-col"
        md="space-x-4"
      >
        <div className="flex-1">
          <div className="flex py-4">
            <p className="flex-1 text-white/75 underline underline-dashed">
              Maximum marketcap
            </p>
            <p>
              {formatPrice(
                solPrice * normalizeBN(mint.boundingCurve.maximumMarketCap)
              )}
            </p>
          </div>
          <div className="flex py-4">
            <p className="flex-1 text-white/75 underline underline-dashed">
              Current Marketcap
            </p>
            <p>{formatPrice(solPrice * normalizeBN(mint.virtualMarketCap))}</p>
          </div>

          <div className="flex py-4">
            <p className="flex-1 text-white/75 underline underline-dashed">
              Bounding Curve
            </p>
            <p className="sol">{normalizeBN(mint.marketCap)}</p>
          </div>
          <div className="flex py-4">
            <p className="flex-1 text-white/75 underline underline-dashed">
              Total Volume
            </p>
            <p className="sol">{normalizeBN(mint.volumeIn)}</p>
          </div>
          <div className="flex py-4">
            <p className="flex-1 text-white/75 underline underline-dashed">
              Initial Price
            </p>
            <p className="sol">
              {formatPrice(
                solPrice * toUiAmount(mint.boundingCurve.initialPrice)
              )}
            </p>
          </div>
          <div className="flex py-4">
            <p className="flex-1 text-white/75 underline underline-dashed">
              Total Supply
            </p>
            <p>
              {normalizeBN(mint.boundingCurve.curveInitialSupply, 6)}{" "}
              {mint.ticker}
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
              Bounding curve
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
