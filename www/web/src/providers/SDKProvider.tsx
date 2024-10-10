import Api from "@hashfund/sdk";
import { createContext, useMemo } from "react";
import { useAnchorWallet } from "@solana/wallet-adapter-react";

export type SDKContext = {
  api: Api;
};

export const SDKContext = createContext<Partial<SDKContext>>({});

type Props = {
  baseURL: string;
} & React.PropsWithChildren;

export default function SDKProvider({ baseURL, children }: Props) {
  const wallet = useAnchorWallet();
  const api = useMemo(
    () => new Api(baseURL, wallet?.publicKey.toBase58()),
    [wallet]
  );

  return <SDKContext.Provider value={{ api }}>{children}</SDKContext.Provider>;
}
