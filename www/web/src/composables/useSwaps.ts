import { useEffect, useState } from "react";

import Api from "@/lib/api";

export default function useSwaps(mint: string) {
  return Api.instance.swap
    .getSwapsByMint(mint)
    .then(({ data }) => data)
}
