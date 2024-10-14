import moment from "moment";
import { useEffect, useRef } from "react";
import {
  type IChartingLibraryWidget,
  type LanguageCode,
  widget as Widget,
  type ResolutionString,
} from "@hashfund/chart";

import { Api } from "@/lib/api";
import { normalizeBN } from "@/web3";
import { resolveResolution } from "@/lib/graph";

type ChartViewProps = {
  width: number;
  height: number;
  locale?: LanguageCode;
  mint: string;
};

export default function ChartView({
  width,
  height,
  mint,
  locale = "en",
}: ChartViewProps) {
  const container = useRef<HTMLDivElement>(null);
  const widget = useRef<IChartingLibraryWidget | null>(null);

  useEffect(() => {
    if (container.current) {
      widget.current = new Widget({
        container: container.current,
        symbol: mint,
        width,
        height,
        locale,
        theme: "dark",
        debug: true,
        interval: "5" as ResolutionString,
        datafeed: {
          async onReady(callback) {
            setTimeout(() =>
              callback({
                supports_time: true,
                supports_timescale_marks: true,
                supports_marks: true,
                supported_resolutions: ["1", "15", "30"] as ResolutionString[],
              })
            );
          },
          searchSymbols(userInput, exchange, symbolType, onResult) {
            Api.instance.mint
              .list({ search: userInput, exchange, symbolType })
              .then(({ data }) =>
                onResult(
                  data.results.map((mint) => ({
                    symbol: mint.id,
                    full_name: mint.name,
                    description: mint.metadata.description,
                    exchange: "HashFund",
                    type: "Crypto",
                    ticker: mint.id,
                    logo_urls: [mint.metadata.image],
                    exchange_logo: "",
                  }))
                )
              );
          },
          async resolveSymbol(symbolName, onResolve, onError) {
            Api.instance.mint
              .retrieve(symbolName)
              .then(({ data }) =>
                onResolve({
                  name: data.name,
                  ticker: data.symbol,
                  unit_id: data.id,
                  description: data.metadata.description,
                  logo_urls: [data.metadata.image],
                  type: "crypto",
                  exchange: "HashFund",
                  listed_exchange: "HashFund",
                  timezone: "Etc/UTC",
                  format: "price",
                  pricescale: Math.pow(10, data.decimals),
                  minmov: 1 / Math.pow(10, data.decimals),
                  visible_plots_set: "ohlc",
                  data_status: "streaming",
                  session: "24x7",
                  has_intraday: true,
                })
              )
              .catch(onError);
          },
          getBars(symbolInfo, resolution, periodParams, onResult, onError) {
            const from = new Date(periodParams.from * 1000);
            const to = new Date(periodParams.to * 1000);

            Api.instance.swap
              .getSwapsGraph({
                mint: symbolInfo.unit_id!,
                timestamp__gte: from.toISOString(),
                timestamp__lte: to.toISOString(),
                limit: periodParams.countBack.toString(),
                ...resolveResolution(resolution),
              })
              .then(({ data }) => {
                const graph = data.results.map((data) => {
                  const time = moment(data.time).unix() / 1000;
                  const decimals = Math.log10(symbolInfo.pricescale);

                  console.log("decimals=", decimals);

                  const low = normalizeBN(data.low, decimals);
                  const high = normalizeBN(data.high, decimals);
                  const open = normalizeBN(data.open, decimals);
                  const close = normalizeBN(data.close, decimals);

                  return {
                    low,
                    high,
                    open,
                    close,
                    time,
                  };
                });
                if (graph.length > 0) onResult(graph, { noData: false });
              })
              .catch(onError);
          },
          subscribeBars() {},
          unsubscribeBars() {},
        },
        enabled_features: ["seconds_resolution", "tick_resolution"],
      });
    }
  }, [container]);

  return <div ref={container} />;
}
