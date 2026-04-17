import ImageKit from "imagekit";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

import {
  IMAGEKIT_PRIVATE_KEY,
  IMAGEKIT_PUBLIC_KEY,
  IMAGEKIT_URL_ENDPOINT,
} from "../../config";

// Robust initialization handling potential import variations in ESM/CommonJS
const ImageKitLib = (ImageKit as any).default || ImageKit;

export const imagekit = new ImageKitLib({
  publicKey: IMAGEKIT_PUBLIC_KEY,
  privateKey: IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: IMAGEKIT_URL_ENDPOINT,
});

const imagekitAuthRoute = async function (request: FastifyRequest, reply: FastifyReply) {
  try {
     const authParams = imagekit.getAuthenticationParameters();
     return authParams;
  } catch (error) {
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

export const registerAssetRoutes = (fastify: FastifyInstance) => {
  fastify.get("/imagekit/auth", imagekitAuthRoute);
  fastify.post("/imagekit/upload", uploadFileRoute);
};
