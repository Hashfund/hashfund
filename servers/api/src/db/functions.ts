import { Column, sql, SQL } from "drizzle-orm";

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

export const extract = <T extends Column | string>(
  value: "MINUTES" | "HOUR",
  column: T
) => sql`EXTRACT('${value}' FROM ${column})`;
