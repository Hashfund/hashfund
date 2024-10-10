"use client";
import type { MintWithExtra } from "@hashfund/sdk/models";

import Link from "next/link";
import Image from "next/image";

import { PythFeed } from "@/config/pyth";
import { useFeedPrice } from "@/composables/useFeedPrice";
import { percentageBN, formatPrice, normalizeBN, Explorer } from "@/web3";

import { SwapButton } from "../swap";
import ProgressBar from "../ProgressBar";
import SocialList from "./SocialList";

type HeaderProps = {
  mint: MintWithExtra;
};

export function Header({ mint }: HeaderProps) {
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
                    normalizeBN(mint.boundingCurve.virtualPairBalance, 9)
                )}
              </p>
              <ProgressBar
                className="w-48 lt-md:flex-1"
                value={normalizeBN(
                  percentageBN(
                    mint.boundingCurve.maximumPairBalance,
                    mint.boundingCurve.virtualPairBalance
                  ),
                  9
                )}
              />
              <p lt-md="self-end">
                {formatPrice(
                  solPrice *
                    normalizeBN(mint.boundingCurve.maximumPairBalance, 9)
                )}
              </p>
            </div>
            <div className="max-w-md flex flex-1 flex-col text-xs text-white/75 space-y-2">
              <p>
                When the market cap reaches&nbsp;
                {formatPrice(
                  solPrice *
                    normalizeBN(mint.boundingCurve.minimumPairBalance, 9)
                )}
                &nbsp; all the liquidity from the bonding curve will be
                deposited into Raydium and burned. progression increases as the
                price goes up.
              </p>
              <p>
                There are{" "}
                {normalizeBN(
                  mint.boundingCurve.virtualTokenBalance,
                  mint.decimals
                )}{" "}
                tokens still available for sale in the bonding curve and there
                is&nbsp;
                {normalizeBN(mint.boundingCurve.virtualPairBalance, 9)} SOL in
                the bonding curve.
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
