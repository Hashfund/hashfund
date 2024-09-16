import Api from "@/lib/api";

export default function useMint(mintAddress: string) {
  return Api.instance.mint.getMint(mintAddress).then(({ data }) => data);
}
