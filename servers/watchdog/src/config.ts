import "dotenv/config";

import * as fs from "fs";
import { web3 } from "@coral-xyz/anchor";

export const ANCHOR_PROVIDER_URL = process.env.ANCHOR_PROVIDER_URL!;

if (!ANCHOR_PROVIDER_URL) {
  throw new Error("[Watchdog] FATAL: ANCHOR_PROVIDER_URL env var is required but was not set.");
}

// Load the keypair from environment variable (JSON array string) or local file fallback
function loadKeypair() {
  const envKey = process.env.WALLET_PRIVATE_KEY;
  if (envKey) {
    try {
      return web3.Keypair.fromSecretKey(Uint8Array.from(JSON.parse(envKey)));
    } catch (e) {
      console.error("Failed to parse WALLET_PRIVATE_KEY from environment");
    }
  }

  const localPath = process.env.KEYPAIR_PATH || "../../packages/zeroboost/target/deploy/zeroboost-keypair.json";
  try {
    if (fs.existsSync(localPath)) {
      return web3.Keypair.fromSecretKey(Uint8Array.from(JSON.parse(fs.readFileSync(localPath, "utf8"))));
    }
  } catch (e) {
    console.warn(`Local keypair not found at ${localPath}. Watchdog may fail to sign transactions.`);
  }

  // Fallback to a random keypair to prevent immediate crash if only reading is required
  return web3.Keypair.generate();
}

export const ANCHOR_WALLET = loadKeypair();
