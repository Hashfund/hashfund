import { Api } from "@/lib/api";
import type { RouteProps } from "@/types";
import { Annoucement, RecentMint, RecentFreed, Token } from "@/components/home";

type SearchParams = {
  search: string;
  orderBy: string;
};

export default async function HomePage({
  searchParams,
}: RouteProps<any, SearchParams>) {
  const { search, orderBy } = searchParams;
  
  const mints = await Api.instance.mint.list({
    search,
    orderBy,
  }).then(({ data }) => data.results);

  return (
    <main className="flex flex-col space-y-8">
      <Annoucement className="self-center" />
      <div
        className="flex px-4 md:px-8"
        lt-md="flex-col space-y-8"
        md="space-x-6"
      >
        <RecentMint
          mints={mints}
          className="flex-1"
        />
        <RecentFreed
          mints={mints}
          className="flex-1"
        />
      </div>
      <Token mints={mints} />
    </main>
  );
}
