"use client";

import clsx from "clsx";
import Link from "next/link";

import { Mint } from "@/lib/api/models";
import { Explorer } from "@/web3/link";
import useTokenHolders from "@/composables/useTokenHolders";

import LeaderboardItem from "../LeaderboardItem";
import { normalizeBN } from "@/web3/decimal";

type MintHoldListProps = {
  mint: Mint;
  className?: string;
};

export default function MintHoldList({ mint, className }: MintHoldListProps) {
  const holders = useTokenHolders(mint);
  const totalSupply = normalizeBN(mint.boundingCurve.curveInitialSupply, 6);

  return (
    <div className={clsx(className, "flex flex-col space-y-4")}>
      <div className="flex items-center">
        <div className="flex-1">
          <h1 className="text-lg">Holder distribution</h1>
        </div>
        <button className="btn bg-secondary">Generate bubble map</button>
      </div>

      <div className="flex flex-1 flex-col space-y-4">
        {holders &&
          holders.map((holder, index) => (
            <Link
              key={holder.address.toBase58()}
              href={Explorer.buildAccount(holder.address.toBase58())}
              target="_blank"
            >
              <LeaderboardItem
                index={index + 1}
                user={{
                  id: holder.address.toBase58(),
                  name: holder.isDev
                    ? "(Dev)"
                    : holder.isBoundingCurve
                    ? "Bounding Curve"
                    : "",
                  avatar: "",
                }}
                amount={(holder.uiAmount! / totalSupply) * 100}
                ticker={"%"}
              />
            </Link>
          ))}
      </div>
    </div>
  );
}
