import { Mint } from "./mint.model";

export type User = {
  id: string;
  name: string;
  avatar: string;
};

export type Leaderboard = Pick<Mint, "volumeIn" | "volumeOut"> & { user: User };
