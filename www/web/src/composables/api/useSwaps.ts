import Api from "@/lib/api";

export default function useSwaps(query?: Record<string, any>) {
  return Api.instance.swap.getSwaps(query).then(({ data }) => data);
}
