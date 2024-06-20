import { readFileSync } from "fs";
import bs58 from "bs58";

import { Keypair } from "@solana/web3.js";

export function loadWallet(path: string) {
  return Keypair.fromSecretKey(
    new Uint8Array(JSON.parse(readFileSync(path, "utf-8")))
  );
}

export function loadWalletFromPriv(value: string) {
  return Keypair.fromSecretKey(bs58.decode(value));
}
