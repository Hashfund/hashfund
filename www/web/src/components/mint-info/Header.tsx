"use client";

import Link from "next/link";
import Image from "next/image";

import { TokenAmount } from "@solana/web3.js";

import { Mint } from "@/lib/api/models";
import useFeedPrice from "@/lib/api/useFeedPrice";

import { PythFeed } from "@/config/pyth";

import { Explorer } from "@/web3/link";
import { formatPrice } from "@/web3/price";
import { normalizeBN } from "@/web3/decimal";
import { calculateBNPercentage } from "@/web3/math";

import { SwapButton } from "../swap";
import ProgressBar from "../ProgressBar";
import SocialList from "./SocialList";

type HeaderProps = {
  mint: Mint;
  boundingCurveBalance: TokenAmount;
};

export function Header({ mint, boundingCurveBalance }: HeaderProps) {
  const solPrice = useFeedPrice(PythFeed.SOL_USD);

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
              <p className="text-2xl font-bold">{mint.name}</p>
              <small className="text-white/75">
                {mint.metadata?.description}
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
              <p>
                {formatPrice(
                  solPrice *
                    normalizeBN(
                      mint.canTrade
                        ? mint.marketCap
                        : mint.boundingCurve.maximumMarketCap
                    )
                )}
              </p>
              <ProgressBar
                className="w-48 lt-md:flex-1"
                value={calculateBNPercentage(
                  mint.canTrade
                    ? mint.marketCap
                    : mint.boundingCurve.maximumMarketCap,
                  mint.boundingCurve.maximumMarketCap
                )}
              />
              <p lt-md="self-end">
                {formatPrice(
                  solPrice * normalizeBN(mint.boundingCurve.maximumMarketCap)
                )}
              </p>
            </div>
            <div className="max-w-md flex flex-1 flex-col text-xs text-white/75 space-y-2">
              <p>
                When the market cap reaches{" "}
                {formatPrice(
                  solPrice * normalizeBN(mint.boundingCurve.maximumMarketCap)
                )}{" "}
                all the liquidity from the bonding curve will be deposited into
                Raydium and burned. progression increases as the price goes up.
              </p>
              <p>
                There are {boundingCurveBalance.uiAmountString} tokens still
                available for sale in the bonding curve and there is{" "}
                {normalizeBN(mint.marketCap)} SOL in the bonding curve.
              </p>
            </div>
          </div>
        </div>
        <div>
          {mint.canTrade && <SwapButton mint={mint} />}
          {mint.hash && (
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
