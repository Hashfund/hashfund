import "dotenv/config";

import * as fs from "fs";
import { web3 } from "@coral-xyz/anchor";

export const ANCHOR_PROVIDER_URL = process.env.ANCHOR_PROVIDER_URL!;

// Load the keypair from the JSON file directly
const KEYPAIR_PATH = "/mnt/c/Users/rolan/projects/hashfund/packages/zeroboost/target/deploy/zeroboost-keypair.json";
const secretKey = Uint8Array.from(JSON.parse(fs.readFileSync(KEYPAIR_PATH, "utf8")));

export const ANCHOR_WALLET = web3.Keypair.fromSecretKey(secretKey);
