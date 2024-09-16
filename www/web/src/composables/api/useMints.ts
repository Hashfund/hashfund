import { useEffect, useState } from "react";

import Api from "@/lib/api";
import { Mint } from "@/lib/api/models";

export const useMints = async (query: Record<string, any>) => {
  const { next, results } = await Api.instance.mint
    .getAllMints(query)
    .then(({ data }) => data);

  return {
    next,
    mints: results,
  } as const;
};
