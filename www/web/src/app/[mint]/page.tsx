import { PublicKey } from "@solana/web3.js";

import { HASHFUND_PROGRAM_ID } from "@hashfund/program";
import { findBoundingCurveReservePda } from "@hashfund/program/dist/utils";

import { connection } from "@/web3";
import { RouteProps } from "@/types";
import useMint from "@/composables/api/useMint";
import useSwaps from "@/composables/api/useSwaps";
import { TradeList } from "@/components/TradeList";
import useLeaderboard from "@/composables/api/useLeaderboard";
import BalanceProvider from "@/providers/BalanceProvider";
import MintHoldList from "@/components/mint-info/MintHodlList";
import useTokenBalance from "@/composables/useTokenBalance";
import {
  MintInfoGraph,
  Header,
  MyInfo,
  Info,
  HodlList,
  LiquidList,
} from "@/components/mint-info";

export default async function MintInfoPage({
  params: { mint: qMint },
}: RouteProps) {
  const mint = await useMint(qMint);
  const { results: swaps } = await useSwaps({ mint: qMint });
  const hodlers = await useLeaderboard(qMint, "volumeIn");
  const liquidators = await useLeaderboard(qMint, "volumeOut");

  const [boundingCurveReserve] = findBoundingCurveReservePda(
    new PublicKey(mint.boundingCurve.id),
    HASHFUND_PROGRAM_ID
  );

  const boundingCurveBalance = await useTokenBalance(
    connection,
    qMint,
    boundingCurveReserve.toBase58()
  );

  return (
    <BalanceProvider mint={mint.id}>
      <main className="flex flex-col space-y-8">
        <Header
          mint={mint}
          boundingCurveBalance={boundingCurveBalance}
        />
        <MintInfoGraph mint={mint} />
        <div className="flex flex-col overflow-y-scroll space-y-4">
          <div className="px-4 md:px-8">
            <h1 className="text-2xl font-medium">Trades</h1>
          </div>
          <TradeList
            mint={mint}
            swaps={swaps}
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
              leaderboard={hodlers}
              className="flex-1"
            />
            <LiquidList
              leaderboard={liquidators}
              className="flex-1"
            />
          </div>
        </div>
        <Info mint={mint} />
      </main>
    </BalanceProvider>
  );
}
