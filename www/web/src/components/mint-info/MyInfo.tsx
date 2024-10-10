"use client";
import { Mint, MintWithExtra } from "@hashfund/sdk/models";

import { PythFeed } from "@/config/pyth";
import { formatPrice } from "@/web3/price";
import { normalizeBN } from "@/web3/decimal";
import useBalance from "@/composables/useBalance";
import { useFeedPrice } from "@/composables/useFeedPrice";
import { useSDK } from "@/composables/useSDK";

type MyInfoProps = {
  mint: MintWithExtra;
};

export function MyInfo({ mint }: MyInfoProps) {
  const { mintBalance } = useBalance();
  
  const swap = undefined;
  const solPrice = useFeedPrice(PythFeed.SOL_USD);

  return (
    swap && (
      <section
        className="bg-secondary/10 p-4 text-white/75"
        md="px-8"
      >
        <div className="border-b border-dark-100 py-4">
          <h1 className="text-2xl font-medium">Info</h1>
        </div>
        <div className="flex flex-col divide-y divide-dark-100">
          <div className="flex py-2">
            <p className="flex-1">Balance</p>
            <p>
              {mintBalance?.uiAmount} {mint.symbol}
            </p>
          </div>
          <div className="flex py-2">
            <p className="flex-1">Value</p>
            <p>
              {formatPrice(
                (mintBalance?.uiAmount ?? 0) *
                  mint.boundingCurve.initialPrice *
                  solPrice
              )}
            </p>
          </div>
          <div className="flex py-2">
            <p className="flex-1">Buy</p>
            <p>{}</p>
          </div>
          <div className="flex py-2">
            <p className="flex-1">Sold</p>
            <p>{}</p>
          </div>
        </div>
      </section>
    )
  );
}
