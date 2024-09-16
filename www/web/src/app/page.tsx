import { RouteProps } from "@/types";
import { useMints } from "@/composables/api/useMints";
import { Annoucement, RecentMint, RecentFreed, Token } from "@/components/home";

export default async function HomePage({ searchParams }: RouteProps) {
  const tokenSortBy = searchParams.token_sort_by ?? "market_cap";
  const search = searchParams.token_search;

  const { mints: recent } = await useMints({ orderBy: "timestamp" });
  const { mints: freed } = await useMints({
    orderBy: "timestamp",
    canTrade: false,
  });
  let query: Record<string, any> = { orderBy: tokenSortBy };
  if (search) query = { ...query, search };
  const { mints } = await useMints(query);

  return (
    <main className="flex flex-col space-y-8">
      <Annoucement className="self-center" />
      <div
        className="flex px-4 md:px-8"
        lt-md="flex-col space-y-8"
        md="space-x-6"
      >
        <RecentMint
          mints={recent}
          className="flex-1"
        />
        <RecentFreed
          mints={freed}
          className="flex-1"
        />
      </div>
      <Token mints={mints} />
    </main>
  );
}
