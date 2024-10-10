import { MintWithExtra } from "@hashfund/sdk/models";
import {
  ZERO_BOOST_PROGRAM,
  getBoundingCurveReservePda,
} from "@hashfund/zeroboost";
import { PublicKey } from "@solana/web3.js";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";

import { connection } from "@/web3";

export const getTokenLargeAccounts = async ({
  boundingCurve: { id: boundingCurveId },
  id: mintId,
  creator: creatorId,
}: MintWithExtra) => {
  const mint = new PublicKey(mintId);
  const creator = new PublicKey(creatorId);
  const boundingCurve = new PublicKey(boundingCurveId);

  const boundingCurveAta = getAssociatedTokenAddressSync(
    mint,
    boundingCurve,
    true
  );
  const [boundingCurveReserve] = getBoundingCurveReservePda(
    boundingCurve,
    ZERO_BOOST_PROGRAM
  );
  const boundingCurveReserveAta = getAssociatedTokenAddressSync(
    mint,
    boundingCurveReserve,
    true
  );
  const devAta = getAssociatedTokenAddressSync(mint, creator);

  const { value } = await connection.getTokenLargestAccounts(mint);
  return value.map((tokenBalance) => ({
    ...tokenBalance,
    isDev: tokenBalance.address.equals(devAta),
    isBoundingCurve: tokenBalance.address.equals(boundingCurveAta),
    isBoundingCurveReserve: tokenBalance.address.equals(
      boundingCurveReserveAta
    ),
  }));
};
