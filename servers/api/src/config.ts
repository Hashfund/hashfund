import "dotenv/config";
import { BN } from "bn.js";

export const HOST = process.env.HOST || "0.0.0.0";
export const PORT = Number(process.env.PORT || 3001);
export const DB_URL = process.env.DATABASE_URL!;
export const SECRET_KEY = process.env.SECRET_KEY!;
export const HTTP_RPC_ENDPOINT = process.env.HTTP_RPC_ENDPOINT!;
export const WSS_RPC_ENDPOINT = process.env.WSS_RPC_ENDPOINT!;
export const IMAGEKIT_PUBLIC_KEY = process.env.IMAGEKIT_PUBLIC_KEY || "";
export const IMAGEKIT_PRIVATE_KEY = process.env.IMAGEKIT_PRIVATE_KEY || "";
export const IMAGEKIT_URL_ENDPOINT = process.env.IMAGEKIT_URL_ENDPOINT || "";

if (!DB_URL) {
  console.error("CRITICAL: DATABASE_URL is missing! Connection will fail.");
}

if (!IMAGEKIT_PUBLIC_KEY || !IMAGEKIT_PRIVATE_KEY || !IMAGEKIT_URL_ENDPOINT) {
  console.warn("WARNING: ImageKit environment variables are missing! Token creation will fail.");
}

export const NATIVE_MINT_DECIMALS = new BN(10).pow(new BN(9));
