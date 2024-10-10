"use client";
import { web3 } from "@coral-xyz/anchor";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";

import { BASE_API_URL } from "@/config";
import { PythFeed } from "@/config/pyth";
import { useWalletList } from "@/composables/useWalletList";

import SDKProvider from "./SDKProvider";
import AuthProvider from "./AuthProvider";
import ProgramProvider from "./ProgramProvider";
import PythPriceProvider from "./PythPriceProvider";
import NavigationProvider from "./NavigationProvider";

type Props = {
  rpcEndpoint: string;
  zeroboostProgram: string;
} & React.PropsWithChildren;

export default function Provider({
  rpcEndpoint,
  zeroboostProgram,
  children,
}: Props) {
  const wallets = useWalletList();

  return (
    <PythPriceProvider feeds={[PythFeed.SOL_USD]}>
      <NavigationProvider>
        <ConnectionProvider
          endpoint={rpcEndpoint}
          config={{ commitment: "confirmed" }}
        >
          <WalletProvider
            wallets={wallets}
            autoConnect
          >
            <WalletModalProvider>
              <ProgramProvider programId={new web3.PublicKey(zeroboostProgram)}>
                <SDKProvider baseURL={BASE_API_URL}>
                  <AuthProvider>{children}</AuthProvider>
                </SDKProvider>
              </ProgramProvider>
            </WalletModalProvider>
          </WalletProvider>
        </ConnectionProvider>
      </NavigationProvider>
    </PythPriceProvider>
  );
}
