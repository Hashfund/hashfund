import { FastifyInstance } from "fastify";
import { registerMintRoutes } from "./mint/mint.route";
import { registerUserRoutes } from "./user/user.route";
import { registerSwapRoutes } from "./swap/swap.route";
import { registerAssetRoutes } from "./asset/asset.route";

const routes = async (server: FastifyInstance) => {
  await registerAssetRoutes(server);
  await registerUserRoutes(server);
  await registerMintRoutes(server);
  await registerSwapRoutes(server);
};

export const registerRoutes = async (server: FastifyInstance) => {
  await server.register(routes, { prefix: "/api/v1" });
};
