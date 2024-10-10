import clsx from "clsx";
import Link from "next/link";
import type { MintWithExtra } from "@hashfund/sdk/models";

import { Explorer } from "@/web3/link";
import { truncateAddress } from "@/web3";
import { normalizeBN } from "@/web3/decimal";
import { getTokenLargeAccounts } from "@/actions/getTokenLargeAccounts";

import LeaderboardItem from "../LeaderboardItem";

type MintHoldListProps = {
  mint: MintWithExtra;
  className?: string;
};

export default async function MintHoldList({
  mint,
  className,
}: MintHoldListProps) {
  const supply = normalizeBN(mint.supply, 6);
  const holders = await getTokenLargeAccounts(mint);

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
                    : holder.isBoundingCurveReserve
                    ? "Bounding Curve Reserve"
                    : truncateAddress(holder.address.toBase58()),
                  avatar: "",
                }}
                amount={(holder.uiAmount! / supply) * 100}
                ticker={"%"}
              />
            </Link>
          ))}
      </div>
    </div>
  );
}
