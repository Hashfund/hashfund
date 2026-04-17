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
  let mint;
  try {
    const response = await Api.instance.mint.retrieve(params.mint);
    mint = response.data;
  } catch (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <h1 className="text-2xl font-medium text-white">Indexing Token...</h1>
        <p className="text-gray-400">This token was just created. We are fetching data from the blockchain. Please wait a moment.</p>
        <meta httpEquiv="refresh" content="5" />
      </div>
    );
  }

  return (
    <BalanceProvider mint={mint.id}>
      <div className="flex flex-col space-y-10 pb-20">
        <Header mint={mint} />

        <div className="px-4 md:px-8">
          <MintInfoGraph mint={mint} />
        </div>

        <div className="flex flex-col space-y-4 px-4 md:px-8">
          <div>
            <h1 className="text-2xl font-medium">Trades</h1>
          </div>
          <TradeList
            mint={mint}
            solPrice={1}
            className="w-full"
          />
        </div>

        <div className="px-4 md:px-8">
          <MyInfo mint={mint} />
        </div>

        <div
          className="min-h-sm flex px-4 md:px-8"
          lt-xl="flex-col space-y-6"
          xl="space-x-6"
        >
          <MintHoldList
            mint={mint}
            className="min-w-xs flex-1 bg-white/2 rounded-lg p-4 border border-white/5"
          />
          <div
            className="flex flex-[2] space-x-4"
            lt-md="flex-col space-y-6 space-x-0"
          >
            <HodlList
              mint={mint}
              className="flex-1 bg-white/2 rounded-lg p-4 border border-white/5"
            />
            <LiquidList
              mint={mint}
              className="flex-1 bg-white/2 rounded-lg p-4 border border-white/5"
            />
          </div>
        </div>

        <div className="px-4 md:px-8 border-t border-white/5 pt-10">
          <Info mint={mint} />
        </div>
      </div>
    </BalanceProvider>
  );
}
