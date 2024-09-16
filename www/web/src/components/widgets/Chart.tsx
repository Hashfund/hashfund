import clsx from "clsx";
import { useEffect, useRef } from "react";
import { createChart, IChartApi } from "lightweight-charts";
import useScreen from "@/composables/useScreen";

type Data =
  | { time: number; value: number }
  | { time: number; open: number; close: number };

type ChartProps = {
  onClick?: (data: Data) => void;
  className?: string;
  data: Data[];
};

export default function Chart({ className, data, onClick }: ChartProps) {
  const chart = useRef<IChartApi | null>(null);
  const chartEl = useRef<HTMLDivElement | null>(null);

  const screen = useScreen()!;

  useEffect(() => {
    if (chartEl.current) {
      chart.current = createChart(chartEl.current, {
        width: screen.width > 640 ? screen.width * 0.8 : screen.width * 0.95,
        layout: {
          background: { color: "#222" },
        },
        grid: {
          vertLines: { color: "#444" },
          horzLines: { color: "#444" },
        },
      });
      // const candleSeries = chart.current.addCandlestickSeries();
      // /** @ts-ignore */
      // candleSeries.setData(data);

      const lineSeries = chart.current.addLineSeries();
      /** @ts-ignore */
      lineSeries.setData(data);

      chart.current.subscribeCrosshairMove((data) => {
        if (data.seriesData && onClick) {
          const entries = Array.from(data.seriesData.entries());
          if (entries.length > 0 && entries[0][1])
            onClick(entries[0][1] as any);
        }
      });
    }

    return () => chart.current!.remove();
  }, [chartEl, screen, data]);

  return (
    <div
      ref={chartEl}
      className={clsx(className, "mx-auto")}
    />
  );
}
