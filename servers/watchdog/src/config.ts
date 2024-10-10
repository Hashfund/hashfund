import "dotenv/config";

import bs58 from "bs58";
import { web3 } from "@coral-xyz/anchor";

export const ANCHOR_PROVIDER_URL = process.env.ANCHOR_PROVIDER_URL!;
export const ANCHOR_WALLET = web3.Keypair.fromSecretKey(
  Uint8Array.from(bs58.decode(process.env.ANCHOR_WALLET!))
);
