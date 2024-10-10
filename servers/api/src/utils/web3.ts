import { web3 } from "@coral-xyz/anchor";

export const isAddress = (value: string) => {
  try {
    new web3.PublicKey(value);
    return true;
  } catch {
    return false;
  }
};
