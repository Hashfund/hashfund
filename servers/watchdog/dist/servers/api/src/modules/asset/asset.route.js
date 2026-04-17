"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerAssetRoutes = exports.imagekit = void 0;
const imagekit_1 = __importDefault(require("imagekit"));
const config_1 = require("../../config");
// Robust initialization handling potential import variations in ESM/CommonJS
const ImageKitLib = imagekit_1.default.default || imagekit_1.default;
exports.imagekit = new ImageKitLib({
    publicKey: config_1.IMAGEKIT_PUBLIC_KEY,
    privateKey: config_1.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: config_1.IMAGEKIT_URL_ENDPOINT,
});
const imagekitAuthRoute = async function (request, reply) {
    try {
        const authParams = exports.imagekit.getAuthenticationParameters();
        return authParams;
    }
    catch (error) {
        request.log.error(error, "Failed to generate ImageKit auth parameters");
        return reply.status(500).send({
            error: "Internal Server Error",
            message: "Failed to authenticate with ImageKit. Ensure API configuration is correct.",
        });
    }
};
const uploadFileRoute = function () {
    return {};
};
const registerAssetRoutes = (fastify) => {
    fastify.get("/imagekit/auth", imagekitAuthRoute);
    fastify.post("/imagekit/upload", uploadFileRoute);
};
exports.registerAssetRoutes = registerAssetRoutes;
