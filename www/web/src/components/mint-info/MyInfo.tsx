"use client";

import { normalizeBN } from "@/web3/decimal";
import { formatPrice } from "@/web3/price";
import { PythFeed } from "@/config/pyth";
import { Mint } from "@/lib/api/models";
import useFeedPrice from "@/lib/api/useFeedPrice";
import useBalance from "@/composables/useBalance";
import useUserSwapByMint from "@/composables/api/useUserSwapByMint";

type MyInfoProps = {
  mint: Mint;
};

export function MyInfo({ mint }: MyInfoProps) {
  const solPrice = useFeedPrice(PythFeed.SOL_USD);
  const { mintBalance } = useBalance();
  const swap = useUserSwapByMint(mint.id);

  return (
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
            {mintBalance?.uiAmount} {mint.ticker}
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
          <p>
            {formatPrice(solPrice * normalizeBN(swap?.bought ?? "0"))}
          </p>
        </div>
        <div className="flex py-2">
          <p className="flex-1">Sold</p>
          <p>{formatPrice(solPrice * normalizeBN(swap?.sold ?? "0"))}</p>
        </div>
      </div>
    </section>
  );
}
