import { CrudApi } from "./crud";

export const Omit = <
  T extends Function,
  U extends keyof T["prototype"]
>(
  Class: T,
  ...keys: U[]
) => {

  for (const key of keys) delete Class["prototype"][key];

  return Class as T;
};
