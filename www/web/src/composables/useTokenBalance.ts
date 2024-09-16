import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import { Connection, PublicKey, TokenAmount } from "@solana/web3.js";

export default function useTokenBalance(
  connection: Connection,
  mint: string,
  address: string
) {
  console.log(address);
  const tokenAddress = getAssociatedTokenAddressSync(
    new PublicKey(mint),
    new PublicKey(address),
    true
  );

  console.log(tokenAddress.toBase58());

  return connection
    .getTokenAccountBalance(tokenAddress)
    .then(({ value }) => value);
}
