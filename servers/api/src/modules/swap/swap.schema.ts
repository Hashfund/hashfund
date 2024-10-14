import { z } from "zod";

export const graphSchema = z.object({
  duration: z.custom((input) => {
    const value = Number(input);
    return !Number.isNaN(value);
  }, "Expected number got a string"),
  resolution: z
    .enum(["second", "minute", "hour", "day", "month", "year"])
    .default("minute"),
});
