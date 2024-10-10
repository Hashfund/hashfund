import Link from "next/link";

import TimeFilter from "@/components/widgets/TimeFilter";
import LeaderboardItem from "@/components/LeaderboardItem";

import { Api } from "@/lib/api";
import { Explorer } from "@/web3/link";
import { normalizeBN } from "@/web3/decimal";

export default async function LeaderboardPage() {
  const leaderboard = await Api.instance.user
    .list()
    .then(({ data }) => data.results);

  return (
    <main
      className="flex flex-col px-4 space-y-8"
      md="px-8"
    >
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Leaderboard</h1>
          <p className="text-sm text-white/75">
            Top 100 Hashfund traders by total Volume
          </p>
        </div>
        <TimeFilter />
      </div>
      <div className="flex flex-col space-y-2">
        {leaderboard.map((user, index) => (
          <Link
            key={user.id}
            href={Explorer.buildAccount(user.id)}
            target="_blank"
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
    </main>
  );
}
