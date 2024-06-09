import "dotenv/config";
import { PublicKey } from "@solana/web3.js";

export const PROGRAM_ID = new PublicKey(process.env.PROGRAM_ID!);
