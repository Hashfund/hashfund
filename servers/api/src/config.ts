import "dotenv/config";
import { BN } from "bn.js";

export const HOST = process.env.HOST! ;
export const PORT = Number(process.env.PORT!);
export const DB_URL = process.env.DATABASE_URL!;
export const SECRET_KEY = process.env.SECRET_KEY!;
export const HTTP_RPC_ENDPOINT=process.env.HTTP_RPC_ENDPOINT!;
export const WSS_RPC_ENDPOINT = process.env.WSS_RPC_ENDPOINT!;
export const IMAGEKIT_PUBLIC_KEY = process.env.IMAGEKIT_PUBLIC_KEY!;
export const IMAGEKIT_PRIVATE_KEY = process.env.IMAGEKIT_PRIVATE_KEY!;
export const IMAGEKIT_URL_ENDPOINT = process.env.IMAGEKIT_URL_ENDPOINT!;

export const NATIVE_MINT_DECIMALS = new BN(10).pow(new BN(9));
