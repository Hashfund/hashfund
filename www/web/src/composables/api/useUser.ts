import Api from "@/lib/api";

export default function useUser(id: string) {
  return Api.instance.user.getUser(id).then(({ data }) => data);
}
