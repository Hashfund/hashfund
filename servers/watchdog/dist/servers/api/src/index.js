"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const fastify_1 = __importDefault(require("fastify"));
const cors_1 = __importDefault(require("@fastify/cors"));
const cookie_1 = __importDefault(require("@fastify/cookie"));
const session_1 = __importDefault(require("@fastify/session"));
const passport_1 = __importDefault(require("@fastify/passport"));
const multipart_1 = __importDefault(require("@fastify/multipart"));
const modules_1 = require("./modules");
const config_1 = require("./config");
const main = async () => {
    const server = (0, fastify_1.default)({
        logger: true,
        ignoreTrailingSlash: true,
    });
    server.register(cookie_1.default);
    server.register(session_1.default, { secret: config_1.SECRET_KEY });
    server.register(passport_1.default.initialize());
    server.register(passport_1.default.secureSession());
    await server.register(cors_1.default, {
        origin: "*",
    });
    await server.register(multipart_1.default, {
        attachFieldsToBody: "keyValues",
    });
    (0, modules_1.registerRoutes)(server);
    process.on("SIGINT", async () => await server.close());
    process.on("SIGTERM", async () => await server.close());
    console.log(`[API] Starting server on ${config_1.HOST}:${config_1.PORT}`);
    console.log(`[API] Connecting to database: ${require("./config").DB_URL}`);
    await server.listen({ port: config_1.PORT, host: config_1.HOST }).catch((error) => {
        server.log.error(error);
        process.exit(1);
    });
};
main().catch(console.log);
