"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.graphSchema = void 0;
const zod_1 = require("zod");
exports.graphSchema = zod_1.z.object({
    duration: zod_1.z.custom((input) => {
        const value = Number(input);
        return !Number.isNaN(value);
    }, "Expected number got a string"),
    resolution: zod_1.z
        .enum(["second", "minute", "hour", "day", "month", "year"])
        .default("minute"),
});
