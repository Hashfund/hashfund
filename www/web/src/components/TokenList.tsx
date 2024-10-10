"use client";
import clsx from "clsx";
import type { MintWithExtra } from "@hashfund/sdk/models";

import Link from "next/link";
import Image from "next/image";
import { MdSearch } from "react-icons/md";

import { PythFeed } from "@/config/pyth";
import { formatPrice } from "@/web3/price";
import { normalizeBN } from "@/web3/decimal";
import { useFeedPrice } from "@/composables/useFeedPrice";

type TokenProps = {
  className?: string;
  mints: MintWithExtra[];
};

export function TokenList({ className, mints }: TokenProps) {
  const solPrice = useFeedPrice(PythFeed.SOL_USD);

  return (
    <div
      className={clsx(
        className,
        "flex flex-col space-y-4 overflow-x-scroll min-h-sm"
      )}
    >
      <table className="w-full">
        <thead>
          <tr>
            <th>Token</th>
            <th>Price</th>
            <th>Buy Volume</th>
            <th>Sell Volume</th>
            <th>Volume</th>
            <th>Max Marketcap</th>
            <th>Marketcap</th>
            <th>Tnx</th>
          </tr>
        </thead>
        <tbody>
          {mints.map((mint) => (
            <tr key={mint.id}>
              <td>
                <Link
                  href={mint.id}
                  className="flex items-center space-x-2"
                >
                  <div className="h-12 w-12">
                    <Image
                      src={mint.metadata.image}
                      alt={mint.name}
                      width={64}
                      height={64}
                      className="h-10 w-10 rounded-md"
                    />
                  </div>
                  <p>{mint.name}</p>
                </Link>
              </td>
              <td>
                <Link href={mint.id}>
                  {formatPrice(solPrice * mint.boundingCurve.initialPrice)}
                </Link>
              </td>
              <td>{formatPrice(normalizeBN(mint.market.buyVolume, 9))}</td>
              <td>
                {formatPrice(solPrice * normalizeBN(mint.market.sellVolume, 9))}
              </td>
              <td>
                {formatPrice(solPrice * normalizeBN(mint.market.pairVolume, 9))}
              </td>
              <td>
                {formatPrice(
                  solPrice *
                    normalizeBN(mint.boundingCurve.maximumPairBalance, 9)
                )}
              </td>
              <td>
                {formatPrice(
                  solPrice *
                    normalizeBN(mint.boundingCurve.virtualPairBalance, 9)
                )}
              </td>
              <td>{mint.market.txnCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {mints.length === 0 && (
        <div className="flex flex-1 flex-col items-center justify-center space-y-4">
          <div className="h-8 w-8 flex items-center justify-center rounded-full bg-amber text-black">
            <MdSearch />
          </div>
          <div>
            <p>No Token Found</p>
          </div>
        </div>
      )}
    </div>
  );
}
