"use client";

import clsx from "clsx";
import Link from "next/link";
import Image from "next/image";

import { FaHashtag } from "react-icons/fa";

import { Mint } from "@/lib/api/models";
import useFeedPrice from "@/lib/api/useFeedPrice";

import { PythFeed } from "@/config/pyth";
import { formatPrice } from "@/web3/price";
import { toUiAmount } from "@/web3/math";

type RecentFreedProps = {
  mints: Mint[];
  className?: string;
};

export function RecentFreed({ className, mints }: RecentFreedProps) {
  const solPrice = useFeedPrice(PythFeed.SOL_USD);

  return (
    <section
      className={clsx(
        className,
        "flex flex-col space-y-4 border border-dark pb-4 rounded-md"
      )}
    >
      <div className="flex items-center border-b-1 border-dark px-4 py-4 space-x-4">
        <div className="flex flex-1 items-center space-x-2">
          <FaHashtag className="text-2xl" />
          <p className="text-base font-medium">Recently Hashed</p>
        </div>
      </div>
      {mints.length > 0 ? (
        <div className="flex flex-col divide-y divide-dark">
          {mints.map((mint) => (
            <Link
              key={mint.id}
              href={mint.id}
              className="flex px-4 py-2 space-x-2"
            >
              <div className="flex flex-1 items-center space-x-2">
                <Image
                  src={mint.metadata?.image}
                  alt={mint.name}
                  width={48}
                  height={48}
                  className="h-10 w-10 rounded-md"
                />
                <p>{mint.name}</p>
              </div>
              <div>
                <p className="text-sm">
                  {formatPrice(
                    solPrice * toUiAmount(mint.boundingCurve.initialPrice)
                  )}
                </p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex flex-1 flex-col self-center justify-center text-center space-y-2">
          <p>No token hashed yet</p>
          <button className="btn btn-primary">Buy</button>
        </div>
      )}
    </section>
  );
}
