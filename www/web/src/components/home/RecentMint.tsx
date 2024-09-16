"use client";

import clsx from "clsx";
import Link from "next/link";
import Image from "next/image";
import { MdBolt, MdChevronRight } from "react-icons/md";

import type { Mint } from "@/lib/api/models";
import useFeedPrice from "@/lib/api/useFeedPrice";

import { PythFeed } from "@/config/pyth";
import { formatPrice } from "@/web3/price";
import { toUiAmount } from "@/web3/math";

type RecentMintProps = {
  className?: string;
  mints: Mint[];
};

export function RecentMint({ className, mints }: RecentMintProps) {
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
          <MdBolt className="text-2xl" />
          <p className="text-base font-medium">Recently Mint</p>
        </div>
        <div>
          <Link
            href="/create"
            className="p-2 text-primary"
          >
            Mint Token
          </Link>
        </div>
      </div>
      {mints.length > 0 ? (
        <div className="flex flex-col divide-y divide-dark">
          {mints.map((mint) => (
            <Link
              key={mint.id}
              href={mint.id}
              className="flex items-center px-4 py-2 space-x-2"
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
              <div className="flex items-center space-x-2">
                <p className="text-sm">
                  {formatPrice(
                    solPrice * toUiAmount(mint.boundingCurve.initialPrice)
                  )}
                </p>
                <MdChevronRight className="text-xl" />
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex flex-1 flex-col self-center justify-center text-center space-y-2">
          <p>No token mint yet</p>
          <Link
            href="/create"
            className="btn btn-primary"
          >
            Create
          </Link>
        </div>
      )}
    </section>
  );
}
