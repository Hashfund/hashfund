import { web3 } from "@coral-xyz/anchor";
import { useConnection } from "@solana/wallet-adapter-react";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";

import { useState, useEffect } from "react";

export default function useBalances(
  publicKey: web3.PublicKey | null,
  mint?: string
) {
  const { connection } = useConnection();
  const [solBalance, setSolBalance] = useState(0);
  const [mintBalance, setMintBalance] = useState<web3.TokenAmount | null>(null);

  useEffect(() => {
    if (publicKey) {
      connection.getBalance(publicKey).then(setSolBalance);
      if (mint)
        connection
          .getTokenAccountBalance(
            getAssociatedTokenAddressSync(new web3.PublicKey(mint), publicKey!)
          )
          .then((response) => setMintBalance(response.value));
    }
  }, [publicKey, mint, connection]);

  return { solBalance, mintBalance, setSolBalance, setMintBalance };
}
