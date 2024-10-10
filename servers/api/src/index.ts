import "dotenv/config";
import Fastify from "fastify";
import cors from "@fastify/cors";
import fastifyCookie from "@fastify/cookie";
import fastifySession from "@fastify/session";
import fastifyPassport from "@fastify/passport";
import fastifyMultipart from "@fastify/multipart";

import { registerRoutes } from "./modules";
import { HOST, PORT, SECRET_KEY } from "./config";

const main = async () => {
  const server = Fastify({
    logger: true,
    ignoreTrailingSlash: true,
  });

  server.register(fastifyCookie);
  server.register(fastifySession, { secret: SECRET_KEY });

  server.register(fastifyPassport.initialize());
  server.register(fastifyPassport.secureSession());

  await server.register(cors, {
    origin: "*",
  });

  await server.register(fastifyMultipart, {
    attachFieldsToBody: "keyValues",
  });


  registerRoutes(server);

  process.on("SIGINT", async () => await server.close());
  process.on("SIGTERM", async () => await server.close());

  await server.listen({ port: PORT, host: HOST }).catch((error) => {
    server.log.error(error);
    process.exit(1);
  });
};

main().catch(console.log);
