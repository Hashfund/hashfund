import Api from "@/lib/api";

export default function useLeaderboard(
  id: string,
  orderBy?: "volumeIn" | "volumeOut"
) {
  return Api.instance.mint
    .getLeaderboard(id, { orderBy })
    .then(({ data }) => data);
}
