import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import { web3 } from "@coral-xyz/anchor";

export default async function useTokenBalance(
  connection: web3.Connection,
  mint: string,
  address: string
) {
  const tokenAddress = getAssociatedTokenAddressSync(
    new web3.PublicKey(mint),
    new web3.PublicKey(address),
    true
  );

  const { value } = await connection.getTokenAccountBalance(tokenAddress);
  return value;
}
