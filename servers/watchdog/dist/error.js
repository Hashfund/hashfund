"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.catchAndRetryRuntimeError = void 0;
const utils_1 = require("./utils");
const catchAndRetryRuntimeError = (fn) => {
    let noRetries = 0;
    const proxy = async (data, slot, signature) => {
        if (noRetries >= 5)
            return console.log("Maximum retry depth reached.");
        try {
            noRetries += 1;
            return await fn(data, slot, signature);
        }
        catch (error) {
            console.error("error=", error);
            await (0, utils_1.sleep)(60000);
            return await proxy(data, slot, signature);
        }
    };
    return proxy;
};
exports.catchAndRetryRuntimeError = catchAndRetryRuntimeError;
