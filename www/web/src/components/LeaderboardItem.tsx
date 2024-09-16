import { User } from "@/lib/api/models/user.model";
import { truncateAddress } from "@/web3/address";
import clsx from "clsx";
import { MdAccountCircle } from "react-icons/md";

type LeaderboardItemProps = {
  index: number;
  user: User;
  amount: number;
  ticker: string;
};

export default function LeaderboardItem({
  index,
  user,
  amount,
  ticker,
}: LeaderboardItemProps) {
  return (
    <div className="flex items-center border border-dark-100 rounded p-4">
      <div className="flex flex-1 items-center space-x-4">
        <div
          className={clsx(
            "h-6 w-6 flex items-center justify-center rounded-full bg-dark-100 text-sm",
            { "bg-gold text-black": index === 1, "bg-sliver text-black": index === 2, "bg-bronze": index === 3 }
          )}
        >
          {index}
        </div>
        <div className="rounded-full bg-dark-100 p-2">
          <MdAccountCircle className="text-xl" />
        </div>
        <div>
          <h1>{user.name ?? truncateAddress(user.id)}</h1>
          <p className="text-xs text-white/50">{truncateAddress(user.id)}</p>
        </div>
      </div>
      <div>
        <p>
          {amount} {ticker}
        </p>
      </div>
    </div>
  );
}
