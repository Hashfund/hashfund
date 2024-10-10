import { web3 } from "@coral-xyz/anchor";

export type User = {
  id: string;
  name?: string;
  avatar?: string;
};

export type RefinedUser = {
  id: web3.PublicKey;
} & Pick<User, "name" | "avatar">;


export type UserWithExtra = {
  pairAmount: string
} & User;