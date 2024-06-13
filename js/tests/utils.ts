import { readFileSync } from "fs";
import { Keypair } from "@solana/web3.js";

export function loadWallet(path: string): any {
  return Keypair.fromSecretKey(
    new Uint8Array(JSON.parse(readFileSync(path, "utf-8")))
  );
}
