import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import { Connection, PublicKey, TokenAmount } from "@solana/web3.js";

export default function useTokenBalance(
  connection: Connection,
  mint: string,
  address: string
) {
  const tokenAddress = getAssociatedTokenAddressSync(
    new PublicKey(mint),
    new PublicKey(address),
    true
  );


  return connection
    .getTokenAccountBalance(tokenAddress)
    .then(({ value }) => value);
}
