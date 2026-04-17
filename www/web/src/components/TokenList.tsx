"use client";
import clsx from "clsx";
import type { MintWithExtra } from "@hashfund/sdk/models";

import Link from "next/link";
import Image from "next/image";
import { MdSearch } from "react-icons/md";

import { PythFeed } from "@/config/pyth";
import { formatPrice } from "@/web3/price";
import { normalizeBN } from "@/web3/decimal";
import { getMintMetrics } from "@/web3/metrics";
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
            <th>Buy Vol</th>
            <th>Sell Vol</th>
            <th>Total Vol</th>
            <th>Progress</th>
            <th>Market Cap</th>
            <th>Tnx</th>
          </tr>
        </thead>
        <tbody>
          {mints?.map((mint) => {
            const metrics = getMintMetrics(mint, solPrice || 1);
            return (
              <tr key={mint.id}>
                <td>
                  <Link
                    href={mint.id}
                    className="flex items-center space-x-2"
                  >
                    <div className="h-12 w-12">
                      <Image
                        src={mint.metadata?.image || ""}
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
                    {formatPrice(metrics.displayPriceUsd)}
                  </Link>
                </td>
                <td>{formatPrice(metrics.buyVolumeUsd)}</td>
                <td>{formatPrice(metrics.sellVolumeUsd)}</td>
                <td>{formatPrice(metrics.totalVolumeUsd)}</td>
                <td>
                   <div className="w-24">
                      <div className="text-[10px] text-right mb-0.5">{metrics.bondingProgress.toFixed(1)}%</div>
                      <div className="h-1.5 w-full bg-dark rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary transition-all duration-500" 
                          style={{ width: `${metrics.bondingProgress}%` }}
                        />
                      </div>
                   </div>
                </td>
                <td>{formatPrice(metrics.marketCapUsd)}</td>
                <td>{mint.market?.txnCount || 0}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {(!mints || mints.length === 0) && (
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
