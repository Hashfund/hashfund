import { web3 } from "@coral-xyz/anchor";

import { RPC_URL } from "@/config";

export const connection = new web3.Connection(RPC_URL);

export * from "./asset";
export * from "./link";
export * from "./math";
export * from "./price";
export * from "./address";
export * from "./decimal";