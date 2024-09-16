"use client";
import clsx from "clsx";

import Image from "next/image";
import Link from "next/link";
import { MdSearch } from "react-icons/md";

import { Mint } from "@/lib/api/models";
import useFeedPrice from "@/lib/api/useFeedPrice";

import { normalizeBN } from "@/web3/decimal";
import { PythFeed } from "@/config/pyth";
import { formatPrice } from "@/web3/price";
import {
  calculateMarketcapWeight,
  calculateBNPercentile,
  toUiAmount,
} from "@/web3/math";

type TokenProps = {
  className?: string;
  mints: Mint[];
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
            <th>24h Change</th>
            <th>24h Volume</th>
            <th>Volume</th>
            <th>Max Marketcap</th>
            <th>Collateral Weight</th>
            <th>Marketcap</th>
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
                      src={mint.metadata?.image}
                      alt={mint.name}
                      width={64}
                      height={64}
                      className="h-10 w-10 rounded-md"
                    />
                  </div>
                  <p>{mint.name}</p>
                </Link>
              </td>
              <td className="sol">
                <Link href={mint.id}>
                  {formatPrice(
                    solPrice * toUiAmount(mint.boundingCurve.initialPrice)
                  )}
                </Link>
              </td>
              <td className="per">
                {calculateBNPercentile(mint.volumeIn, mint.volumeInFrom) ?? 0}
              </td>
              <td>{formatPrice(solPrice * normalizeBN(mint.volumeInFrom))}</td>
              <td>{formatPrice(solPrice * normalizeBN(mint.volumeIn))}</td>
              <td>
                {formatPrice(
                  solPrice *
                    normalizeBN(mint.boundingCurve?.maximumMarketCap ?? 0)
                )}
              </td>
              <td>
                {calculateMarketcapWeight(
                  mint.marketCap,
                  mint.boundingCurve?.maximumMarketCap ?? 0
                )}
                x
              </td>
              <td>
                {formatPrice(solPrice * normalizeBN(mint.virtualMarketCap))}
              </td>
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
