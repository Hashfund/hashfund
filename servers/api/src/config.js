"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NATIVE_MINT_DECIMALS = exports.IMAGEKIT_URL_ENDPOINT = exports.IMAGEKIT_PRIVATE_KEY = exports.IMAGEKIT_PUBLIC_KEY = exports.WSS_RPC_ENDPOINT = exports.HTTP_RPC_ENDPOINT = exports.SECRET_KEY = exports.DB_URL = exports.PORT = exports.HOST = void 0;
require("dotenv/config");
const bn_js_1 = require("bn.js");
exports.HOST = process.env.HOST || "0.0.0.0";
exports.PORT = Number(process.env.PORT || 10000);
exports.DB_URL = process.env.DATABASE_URL;
exports.SECRET_KEY = process.env.SECRET_KEY;
exports.HTTP_RPC_ENDPOINT = process.env.HTTP_RPC_ENDPOINT;
exports.WSS_RPC_ENDPOINT = process.env.WSS_RPC_ENDPOINT;
exports.IMAGEKIT_PUBLIC_KEY = process.env.IMAGEKIT_PUBLIC_KEY || "";
exports.IMAGEKIT_PRIVATE_KEY = process.env.IMAGEKIT_PRIVATE_KEY || "";
exports.IMAGEKIT_URL_ENDPOINT = process.env.IMAGEKIT_URL_ENDPOINT || "";
if (!exports.DB_URL) {
    console.error("CRITICAL: DATABASE_URL is missing! Connection will fail.");
}
if (!exports.IMAGEKIT_PUBLIC_KEY || !exports.IMAGEKIT_PRIVATE_KEY || !exports.IMAGEKIT_URL_ENDPOINT) {
    console.warn("WARNING: ImageKit environment variables are missing! Token creation will fail.");
}
exports.NATIVE_MINT_DECIMALS = new bn_js_1.BN(10).pow(new bn_js_1.BN(9));
