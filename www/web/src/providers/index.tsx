"use client";
import { clusterApiUrl } from "@solana/web3.js";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";

import { useWalletList } from "@/composables/useWalletList";
import NavigationProvider from "./NavigationProvider";

import AuthProvider from "./AuthProvider";
import PythPriceProvider from "./PythPriceProvider";
import { PythFeed } from "@/config/pyth";
import { connection } from "@/web3";

export default function Provider({ children }: React.PropsWithChildren) {
  const wallets = useWalletList();

  return (
    <PythPriceProvider feeds={[PythFeed.SOL_USD]}>
      <NavigationProvider>
        <ConnectionProvider
          endpoint={connection.rpcEndpoint}
          config={{ commitment: "confirmed" }}
        >
          <WalletProvider
            wallets={wallets}
            autoConnect
          >
            <WalletModalProvider>
              <AuthProvider>{children}</AuthProvider>
            </WalletModalProvider>
          </WalletProvider>
        </ConnectionProvider>
      </NavigationProvider>
    </PythPriceProvider>
  );
}
