import moment from "moment";
import Api from "@/lib/api";

export const TimeFrame = {
  "24h": 1,
  "7d": 7,
  "30d": 30,
};

const reverseTimeFrame = (key: keyof typeof TimeFrame) => {
  const delta = TimeFrame[key];

  return [
    moment()
      .subtract(delta * 24, "hour")
      .toISOString(),
    new Date().toISOString(),
  ];
};

export default function useGraph(mint: string, timeFrame?: string) {
  if (timeFrame) {
    const [from, to] = reverseTimeFrame(timeFrame as keyof typeof TimeFrame);
    return Api.instance.swap
      .getSwapsByMint(mint, { from, to })
      .then(({ data }) => data);
  }
  return Api.instance.swap.getSwapsByMint(mint).then(({ data }) => data);
}
