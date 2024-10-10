import { Connection } from "@solana/web3.js";

import { RPC_URL } from "@/config";

export const connection = new Connection(RPC_URL);

export * from "./asset";
export * from "./link";
export * from "./math";
export * from "./price";
export * from "./address";
export * from "./decimal";