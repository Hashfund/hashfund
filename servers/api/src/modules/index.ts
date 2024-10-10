import { FastifyInstance } from "fastify";
import { registerMintRoutes } from "./mint/mint.route";
import { registerUserRoutes } from "./user/user.route";
import { registerSwapRoutes } from "./swap/swap.route";
import { registerAssetRoutes } from "./asset/asset.route";

export const registerRoutes = (server: FastifyInstance) => {
  const fns = [registerAssetRoutes, registerUserRoutes, registerMintRoutes, registerSwapRoutes];
  return fns.map((fn) => fn(server));
};
