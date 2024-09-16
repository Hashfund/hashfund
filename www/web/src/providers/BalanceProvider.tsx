"use client";

import { TokenAmount } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";

import { createContext } from "react";

import useBalances from "@/composables/useBalances";

type BalanceContext = {
  solBalance: number;
  mintBalance: TokenAmount | null;
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
  const balance = useBalances(publicKey, mint);

  return (
    <BalanceContext.Provider value={balance}>
      {children}
    </BalanceContext.Provider>
  );
}
