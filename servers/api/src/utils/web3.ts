import { PublicKey } from "@solana/web3.js";

export const isAddress = (value: string) => {
  try {
    new PublicKey(value);
    return true;
  } catch {
    return false;
  }
};
