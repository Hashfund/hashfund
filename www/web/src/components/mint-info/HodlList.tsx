import clsx from "clsx";
import Link from "next/link";

import { normalizeBN } from "@/web3/decimal";
import { Leaderboard } from "@/lib/api/models/user.model";

import LeaderboardItem from "../LeaderboardItem";

type HodlListProps = {
  className?: string;
  leaderboard: Leaderboard[];
};

export function HodlList({ className, leaderboard }: HodlListProps) {
  return (
    <section className={clsx(className, "flex flex-col space-y-4")}>
      <div>
        <h1 className="text-lg">Top Hodlers</h1>
      </div>
      <div className="flex flex-col space-y-2">
        {leaderboard.map((data, index) => (
          <Link
            key={data.user.id}
            href={`/profile/?address=${data.user.id}`}
          >
            <LeaderboardItem
              index={index + 1}
              user={data.user}
              amount={normalizeBN(data.volumeIn)}
              ticker="SOL"
            />
          </Link>
        ))}
      </div>
    </section>
  );
}
