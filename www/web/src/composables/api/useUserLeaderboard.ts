import Api from "@/lib/api";

export default function useUserLeaderboard() {
  return Api.instance.user.getLeaderboard().then(({ data }) => data);
}
