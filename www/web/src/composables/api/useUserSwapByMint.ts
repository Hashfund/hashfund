import { useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";

import Api from "@/lib/api";
import { UserMintSwap } from "@/lib/api/models/swap.model";

export default function useUserSwapByMint(mint: string) {
  const { publicKey } = useWallet();
  const [swap, setSwap] = useState<UserMintSwap | null>(null);

  useEffect(() => {
    if (publicKey) {
      Api.instance.swap
        .getUserSwapByMint(mint, publicKey.toBase58())
        .then(({ data }) => setSwap(data[0]));
    }
  }, [publicKey]);

  return swap;
}
