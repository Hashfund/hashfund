import clsx from "clsx";
import LeaderboardItem from "../LeaderboardItem";
import { Leaderboard } from "@/lib/api/models/user.model";
import { normalizeBN } from "@/web3/decimal";
import Link from "next/link";

type LiquidListProps = {
  className?: string;
  leaderboard: Leaderboard[];
};

export function LiquidList({ className, leaderboard }: LiquidListProps) {
  return (
    <section className={clsx(className, "flex flex-col space-y-4")}>
      <div>
        <h1 className="text-lg">Top Liquidators</h1>
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
              amount={-normalizeBN(data.volumeOut)}
              ticker="SOL"
            />
          </Link>
        ))}
      </div>
    </section>
  );
}
