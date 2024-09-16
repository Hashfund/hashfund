import { useEffect, useState } from "react";

import { WebIrys } from "@irys/sdk";
import type { Cluster } from "@solana/web3.js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";

export default function useIrys(network: Cluster) {
  const wallet = useWallet();
  const { connection } = useConnection();
  const [webIrys, setWebIrys] = useState<WebIrys | null>(null);

  useEffect(() => {
    const webIrys = new WebIrys({
      network,
      token: "solana",
      wallet: {
        rpcUrl: connection.rpcEndpoint,
        name: "solana",
        provider: wallet!,
      },
    });

    webIrys.ready();

    setWebIrys(webIrys);
  }, [wallet]);

  return webIrys;
}
