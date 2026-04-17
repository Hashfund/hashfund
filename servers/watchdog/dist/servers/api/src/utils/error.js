"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.catchRuntimeError = void 0;
const zod_1 = require("zod");
const object_1 = require("./object");
const catchRuntimeError = (fn) => async (request, reply) => Promise.all([fn(request, reply)])
    .then(object_1.safeStringify)
    .then(([result]) => result)
    .catch((error) => {
    if (error instanceof zod_1.ZodError)
        return reply.status(400).send(error.format());
    return reply.status(500).send(error);
});
exports.catchRuntimeError = catchRuntimeError;
