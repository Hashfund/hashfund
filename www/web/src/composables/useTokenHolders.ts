import { HASHFUND_PROGRAM_ID } from "@hashfund/program";
import { findBoundingCurveReservePda } from "@hashfund/program/dist/utils";

import { PublicKey } from "@solana/web3.js";
import { useConnection } from "@solana/wallet-adapter-react";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";

import { useEffect, useState } from "react";

import { Mint } from "@/lib/api/models";

export default function useTokenHolders(mint: Mint) {
  const { connection } = useConnection();

  const [boundingCurveReserve] = findBoundingCurveReservePda(
    new PublicKey(mint.boundingCurve.id),
    HASHFUND_PROGRAM_ID
  );
  const boundingCurveReserveAta = getAssociatedTokenAddressSync(
    new PublicKey(mint.id),
    boundingCurveReserve,
    true
  );
  const devAta = getAssociatedTokenAddressSync(
    new PublicKey(mint.id),
    new PublicKey(mint.creator)
  );

  const getHolders = () =>
    connection
      .getTokenLargestAccounts(new PublicKey(mint.id))
      .then(({ value }) =>
        value.map((tokenBalance) => ({
          ...tokenBalance,
          isDev: tokenBalance.address.equals(devAta),
          isBoundingCurve: tokenBalance.address.equals(boundingCurveReserveAta),
        }))
      );

  const [holders, setHolders] = useState<Awaited<
    ReturnType<typeof getHolders>
  > | null>(null);

  useEffect(() => {
    getHolders().then(setHolders);
  }, [mint]);

  return holders;
}
