"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WSS_RPC_ENDPOINT = exports.HTTP_RPC_ENDPOINT = void 0;
require("dotenv/config");
exports.HTTP_RPC_ENDPOINT = process.env.HTTP_RPC_ENDPOINT;
exports.WSS_RPC_ENDPOINT = process.env.WSS_RPC_ENDPOINT;
