import { Api } from "@/lib/api";
import type { RouteProps } from "@/types";
import { TradeList } from "@/components/TradeList";
import BalanceProvider from "@/providers/BalanceProvider";
import MintHoldList from "@/components/mint-info/MintHodlList";
import {
  MintInfoGraph,
  Header,
  MyInfo,
  Info,
  HodlList,
  LiquidList,
} from "@/components/mint-info";

export default async function MintInfoPage({ params }: RouteProps) {
  const mint = await Api.instance.mint
    .retrieve(params.mint)
    .then(({ data }) => data);

  return (
    <BalanceProvider mint={mint.id}>
      <main className="flex flex-col space-y-8">
        <Header mint={mint} />
        <MintInfoGraph mint={mint} />
        <div className="flex flex-col overflow-y-scroll space-y-4">
          <div className="px-4 md:px-8">
            <h1 className="text-2xl font-medium">Trades</h1>
          </div>
          <TradeList
            mint={mint}
            solPrice={1}
            className="px-4 md:px-8"
          />
        </div>
        <MyInfo mint={mint} />
        <div
          className="min-h-sm flex px-4"
          lt-xl="flex-col space-y-4"
          xl="space-x-4 px-8"
        >
          <MintHoldList
            mint={mint}
            className="min-w-xs"
          />
          <div
            className="flex flex-1"
            lt-md="flex-col space-y-4"
            md="space-x-4"
          >
            <HodlList
              mint={mint}
              className="flex-1"
            />
            <LiquidList
              mint={mint}
              className="flex-1"
            />
          </div>
        </div>
        <Info mint={mint} />
      </main>
    </BalanceProvider>
  );
}
