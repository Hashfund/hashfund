import { PublicKey, TokenAmount } from "@solana/web3.js";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import { useConnection } from "@solana/wallet-adapter-react";

import { useState, useEffect } from "react";

export default function useBalances(
  publicKey: PublicKey | null,
  mint?: string
) {
  const { connection } = useConnection();
  const [solBalance, setSolBalance] = useState(0);
  const [mintBalance, setMintBalance] = useState<TokenAmount | null>(null);

  useEffect(() => {
    if (publicKey) {
      connection.getBalance(publicKey).then(setSolBalance);
      if (mint)
        connection
          .getTokenAccountBalance(
            getAssociatedTokenAddressSync(new PublicKey(mint), publicKey!)
          )
          .then((response) => setMintBalance(response.value));
    }
  }, [publicKey, mint, connection]);

  return { solBalance, mintBalance };
}
