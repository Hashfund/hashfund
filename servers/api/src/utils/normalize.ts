import moment from "moment";
import { Column } from "drizzle-orm";

import { StatusError } from "../error";

export const normalizeBoolean = (column: Column, value: string) => {
  if (Number.isNaN(Number(value))) {
    switch (value) {
      case "true":
        return true;
      case "false":
        return false;
      default:
        throw new StatusError(400, {
          message: "expected a truthy value for " + column.name,
        });
    }
  } else return Boolean(Number(value));
};

export const normalizeNumber = (column: Column, input: string) => {
  const value = Number(input);
  if (Number.isNaN(value))
    throw new StatusError(400, {
      message: "number expected for " + column.name,
    });
};

export const normalizeValue = (column: Column, value: any) => {
  switch (column.dataType) {
    case "bigint":
      return BigInt(value);
    case "date":
      return moment(value).toDate();
    case "boolean":
      return normalizeBoolean(column, value);
    case "json":
      throw new StatusError(400, "json not supported as filter.");
    case "number":
      return normalizeNumber(column, value);
    case "custom":
    case "string":
      return value;
    case "array":
      throw new StatusError(500, "array not supported as filter.");
    case "buffer":
      throw new StatusError(500, "buffer not supported as filter.");
  }
};
