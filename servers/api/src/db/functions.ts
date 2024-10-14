import { Column, sql, SQL } from "drizzle-orm";
import { StatusError } from "../error";

export const toBigInt = <T extends Column>(column: T) =>
  sql`('x' || lpad(${column}, 16, '0'))::bit(64)::bigint`;

export const caseWhen = (
  when: SQL | undefined,
  then?: Column | string | SQL,
  or?: Column | string | number
) =>
  or
    ? sql`case when ${when} then ${then} else ${or} end`
    : sql`case when ${when} then ${then} end`;

export const sub = <T extends Column | string, U extends Column | string>(
  a: T,
  b: U
) => sql`${a} - ${b}`;

export const add = <T extends Column | string, U extends Column | string>(
  a: T,
  b: U
) => sql`coalesce(${a}, 0) + coalesce(${b}, 0)`;

export const hour = <T extends Column | string>(column: T) =>
  sql<number>`date_part('hour', ${column})`;

export const date = <T extends Column | string>(column: T) =>
  sql<number>`date(${column})`;

export const coalesce = <T extends SQL, U extends number | string>(
  exp: T,
  value: U
) => sql<U | number>`COALESCE(${exp}, ${value})`;

export type IntervalUnit = Readonly<
  "SECOND" | "MINUTE" | "HOUR" | "DAY" | "MONTH" | "YEAR" | (string & {})
>;

export const extract = <T extends Column | string>(
  value: IntervalUnit,
  column: T
) => {
  switch (value.toUpperCase()) {
    case "MINUTE":
      return sql`EXTRACT(minutes FROM ${column})`;
    case "HOUR":
      return sql`EXTRACT(hour FROM ${column})`;
    case "YEAR":
      return sql`EXTRACT(year FROM ${column})`;
    default:
      throw new StatusError(
        404,
        "Invalid interval expect second, minute, hour, day, month, year."
      );
  }
};

export const interval = <T extends Column | string>(
  unit: IntervalUnit,
  duration: number,
  column: T
) => {
  switch (unit.toUpperCase()) {
    case "SECOND":
      return sql`date_trunc('minute', ${column} + INTERVAL '1 second' * (FLOOR(EXTRACT(SECOND FROM ${column}) / ${duration}) * ${duration}))`;
    case "MINUTE":
      return sql`date_trunc('hour', ${column} + INTERVAL '1 minute' * (FLOOR(EXTRACT(MINUTE FROM ${column}) / ${duration}) * ${duration}))`;
    case "HOUR":
      return sql`date_trunc('day', ${column} + INTERVAL '1 hour' * (FLOOR(EXTRACT(HOUR FROM ${column}) / ${duration}) * ${duration}))`;
    case "DAY":
      return sql`date_trunc('month', ${column} + INTERVAL '1 day' * (FLOOR(EXTRACT(DAY FROM ${column}) / ${duration}) * ${duration}))`;
    case "MONTH":
      return sql`date_trunc('year', ${column} + INTERVAL '1 month' * (FLOOR(EXTRACT(MONTH FROM ${column}) / ${duration}) * ${duration}))`;
    case "YEAR":
      return sql`date_trunc('year', ${column} + INTERVAL '1 year' * (FLOOR(EXTRACT(YEAR FROM ${column}) / ${duration}) * ${duration}))`;
    default:
      throw new StatusError(
        404,
        "Invalid interval expect second, minute, hour, day, month, year."
      );
  }
};

export const first = <T extends Column | string, U extends Column | string>(
  column: T
) => sql`first(${column})`;

export const last = <T extends Column | string, U extends Column | string>(
  column: T
) => sql`last(${column})`;
