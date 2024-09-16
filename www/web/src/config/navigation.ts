import { IconType } from "react-icons";
import { FaTrophy } from "react-icons/fa";
import { MdBarChart, MdHome, MdStopCircle, MdSwapHoriz } from "react-icons/md";

type Navigation = {
  name: string;
  href: string;
  icon: IconType;
};

export const layoutNavigations: Navigation[] = [
  {
    name: "Home",
    href: "/",
    icon: MdHome,
  },
  // {
  //   name: "Swap",
  //   href: "/swap",
  //   icon: MdSwapHoriz,
  // },
  // {
  //   name: "Stat",
  //   href: "/stat",
  //   icon: MdBarChart,
  // },
  {
    name: "Leaderboard",
    href: "/leaderboard",
    icon: FaTrophy,
  },
  {
    name: "Mint",
    href: "/create",
    icon: MdStopCircle,
  },
];
