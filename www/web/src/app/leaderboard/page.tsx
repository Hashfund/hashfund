import LeaderboardItem from "@/components/LeaderboardItem";
import TimeFilter from "@/components/widgets/TimeFilter";
import useUserLeaderboard from "@/composables/api/useUserLeaderboard";
import { normalizeBN } from "@/web3/decimal";
import { Explorer } from "@/web3/link";
import Link from "next/link";

export default async function LeaderboardPage() {
  const Leaderboard = await useUserLeaderboard();
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
        {Leaderboard.map((data, index) => (
          <Link
            key={data.user.id}
            href={Explorer.buildAccount(data.user.id)}
            target="_blank"
          >
            <LeaderboardItem
              index={index + 1}
              user={data.user}
              amount={normalizeBN(data.volumeIn ?? 0)}
              ticker="SOL"
            />
          </Link>
        ))}
      </div>
    </main>
  );
}
