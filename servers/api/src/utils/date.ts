import { z } from "zod";
import type { Moment } from "moment";

export type DateRangeQuery = {
  to?: string;
  from?: string;
};

export const dateRangeSchema = {
  to: z.string().datetime().optional(),
  from: z.string().datetime().optional(),
};

export type TimeUnit = "day" | "time";

export const buildRange = (from: Moment, to: Moment, unit: TimeUnit) => {
  const results: [Date, Date][] = [];

  switch (unit) {
    case "day":
      while (to.diff(from) > 0) {
        results.push([to.toDate(), to.subtract(1, "day").toDate()]);
      }
      return results;
    case "time":
      while (to.diff(from) > 0) {
        results.push([to.toDate(), to.subtract(5, "minute").toDate()]);
      }
      return results;
  }
};
