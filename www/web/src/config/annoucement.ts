import { IcBoost, IcCoin, IcTrophy } from "@/assets";

type Announcement = {
  icon: typeof IcCoin;
  title: string;
  description: string;
};

export const annoucements: Announcement[] = [
  {
    icon: IcCoin,
    title: "Create a token on HashFund",
    description: "Launch a coin that is instantly tradeable",
  },
  {
    icon: IcBoost,
    title: "Accelerate token migration",
    description: "Migrate token to raydium without seed liquidity",
  },
  {
    icon: IcTrophy,
    title: "Mint to become a hashtor!",
    description: "Displace the current hashtor to get free promotion",
  },
];
