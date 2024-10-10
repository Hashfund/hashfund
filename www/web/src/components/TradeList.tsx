import clsx from "clsx";
import moment from "moment";
import { TradeDirection } from "@hashfund/zeroboost";

import Link from "next/link";
import Image from "next/image";
import type { Mint } from "@hashfund/sdk/models";

import { Api } from "@/lib/api";
import { Explorer } from "@/web3/link";
import { formatPrice } from "@/web3/price";
import { normalizeBN } from "@/web3/decimal";
import { avatarOrDefault } from "@/web3/asset";
import { truncateAddress } from "@/web3/address";

type TradeListProps = {
  className?: string;
  mint: Mint;
  solPrice: number;
};

export async function TradeList({ className, mint, solPrice }: TradeListProps) {
  const swaps = await Api.instance.swap
    .list({
      mint: mint.id,
      orderBy: "timestamp",
    })
    .then(({ data }) => data);

  return (
    <div className={clsx(className, "overflow-x-scroll")}>
      <table className="w-full">
        <thead>
          <tr>
            <th>Account</th>
            <th>Type</th>
            <th>Token</th>
            <th>SOL</th>
            <th>Price</th>
            <th>Date</th>
            <th>Transaction</th>
          </tr>
        </thead>
        <tbody>
          {swaps.results.map((swap) => {
            const profileLink = `/profile?address=${swap.payer.id}`;
            const txLink = Explorer.buildTx(swap.signature);

            return (
              <tr key={swap.id}>
                <td>
                  <Link
                    href={profileLink}
                    className="flex items-center space-x-2"
                  >
                    <div className="h-12 w-12">
                      <Image
                        src={avatarOrDefault(swap.payer.avatar)}
                        alt={swap.payer.name!}
                        width={64}
                        height={64}
                        className="h-10 w-10 rounded-full"
                      />
                    </div>
                    <p>{swap.payer.name}</p>
                  </Link>
                </td>
                <td>
                  <Link
                    href={txLink}
                    className="m-aut0"
                    target="_blank"
                  >
                    {swap.tradeDirection === TradeDirection.AtoB
                      ? "Sell"
                      : "Buy"}
                  </Link>
                </td>
                <td>
                  {normalizeBN(swap.tokenAmount, 6)} {mint.symbol}
                </td>
                <td className="sol">{normalizeBN(swap.pairAmount, 9)}</td>
                <td>
                  {formatPrice(solPrice * normalizeBN(swap.pairAmount, 9))}
                </td>
                <td>{moment(swap.timestamp).fromNow()}</td>
                <td>
                  <Link
                    href={txLink}
                    target="_blank"
                  >
                    {truncateAddress(swap.signature)}
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
