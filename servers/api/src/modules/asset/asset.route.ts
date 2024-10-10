import ImageKit from "imagekit";
import type { FastifyInstance } from "fastify";

import {
  IMAGEKIT_PRIVATE_KEY,
  IMAGEKIT_PUBLIC_KEY,
  IMAGEKIT_URL_ENDPOINT,
} from "../../config";

export const imagekit = new ImageKit({
  publicKey: IMAGEKIT_PUBLIC_KEY,
  privateKey: IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: IMAGEKIT_URL_ENDPOINT,
});

const imagekitAuthRoute = function () {
  return imagekit.getAuthenticationParameters();
};

const uploadFileRoute = function () {
  return {};
};

export const registerAssetRoutes = (fastify: FastifyInstance) => {
  fastify
    .route({
      method: "GET",
      url: "/imagekit/auth",
      handler: imagekitAuthRoute,
    })
    .route({
      method: "POST",
      url: "/imagekit/upload",
      handler: uploadFileRoute,
    });
};
