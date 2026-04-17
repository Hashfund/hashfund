"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerRoutes = void 0;
const mint_route_1 = require("./mint/mint.route");
const user_route_1 = require("./user/user.route");
const swap_route_1 = require("./swap/swap.route");
const asset_route_1 = require("./asset/asset.route");
const routes = async (server) => {
    await (0, asset_route_1.registerAssetRoutes)(server);
    await (0, user_route_1.registerUserRoutes)(server);
    await (0, mint_route_1.registerMintRoutes)(server);
    await (0, swap_route_1.registerSwapRoutes)(server);
};
const registerRoutes = async (server) => {
    await server.register(routes, { prefix: "/api/v1" });
};
exports.registerRoutes = registerRoutes;
