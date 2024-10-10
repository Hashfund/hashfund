import { createContext, useMemo } from "react";
import { IDL, type Zeroboost } from "@hashfund/zeroboost";
import { AnchorProvider, Program, type web3 } from "@coral-xyz/anchor";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";

import { useConfig } from "@/composables/useConfig";

export type ProgramContext = {
  program: Program<Zeroboost>;
  provider: AnchorProvider | { connection: web3.Connection };
  config: Awaited<
    ReturnType<Program<Zeroboost>["account"]["config"]["fetch"]>
  >;
};

export const ProgramContext = createContext<Partial<ProgramContext>>({});

type Props = {
  programId: web3.PublicKey;
} & React.PropsWithChildren;

export default function ProgramProvider({ children, programId }: Props) {
  const wallet = useAnchorWallet();
  const { connection } = useConnection();

  const provider = useMemo(
    () =>
      wallet
        ? new AnchorProvider(connection, wallet, { commitment: "confirmed" })
        : { connection },
    [wallet]
  );
  const program = useMemo(
    () => new Program(IDL, programId, provider),
    [provider]
  );

  const config = useConfig(program);

  return (
    <ProgramContext.Provider value={{ program, provider, config }}>
      {children}
    </ProgramContext.Provider>
  );
}
