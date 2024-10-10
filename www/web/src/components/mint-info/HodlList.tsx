import clsx from "clsx";
import { type Mint } from "@hashfund/sdk/models";
import { TradeDirection } from "@hashfund/zeroboost";

import Link from "next/link";

import { Api } from "@/lib/api";
import { normalizeBN } from "@/web3/decimal";

import LeaderboardItem from "../LeaderboardItem";

type HodlListProps = {
  className?: string;
  mint: Mint;
};

export async function HodlList({ className, mint }: HodlListProps) {
  const users = await Api.instance.user
    .list({
      mint: mint.id,
      orderBy: "pair_amount",
      tradeDirection: TradeDirection.BtoA,
    })
    .then(({ data }) => data.results);

  return (
    <section className={clsx(className, "flex flex-col space-y-4")}>
      <div>
        <h1 className="text-lg">Top Hodlers</h1>
      </div>
      <div className="flex flex-col space-y-2">
        {users.map((user, index) => (
          <Link
            key={user.id}
            href={`/profile/?address=${user.id}`}
          >
            <LeaderboardItem
              index={index + 1}
              user={user}
              amount={normalizeBN(user.pairAmount, 9)}
              ticker="SOL"
            />
          </Link>
        ))}
      </div>
    </section>
  );
}
