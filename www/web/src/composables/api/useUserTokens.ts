import Api from "@/lib/api";

export default async function useUserTokens(id: string) {
  const { results, next } = await Api.instance.user
    .getUserTokens(id)
    .then(({ data }) => data);

  return {
    next,
    tokens: results,
  };
}
