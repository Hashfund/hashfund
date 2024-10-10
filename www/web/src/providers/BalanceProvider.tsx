"use client";

import { web3 } from "@coral-xyz/anchor";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";

import { createContext, useEffect, useRef } from "react";

import useBalances from "@/composables/useBalances";

type BalanceContext = {
  solBalance: number;
  mintBalance: web3.TokenAmount | null;
};

export const BalanceContext = createContext<BalanceContext>({
  solBalance: 0,
  mintBalance: null,
});

type BalanceProviderProps = {
  mint?: string;
} & React.PropsWithChildren;

export default function BalanceProvider({
  mint,
  children,
}: BalanceProviderProps) {
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  
  const subscriptionId = useRef<number | null>();
  const {solBalance, mintBalance} = useBalances(publicKey, mint);

  useEffect(() => {
    if (mint)
      subscriptionId.current = connection.onAccountChange(
        new web3.PublicKey(mint),
        (accountInfo) => {
        }
      );

    return () => {
      if (subscriptionId.current)
        connection.removeAccountChangeListener(subscriptionId.current);
    };
  }, [mint]);

  return (
    <BalanceContext.Provider value={{solBalance, mintBalance}}>
      {children}
    </BalanceContext.Provider>
  );
}
