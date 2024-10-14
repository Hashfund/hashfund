"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MultipleError = exports.catchAndRetryRuntimeError = void 0;
const catchAndRetryRuntimeError = (fn) => async (program, data, signature) => await fn(program, data, signature);
exports.catchAndRetryRuntimeError = catchAndRetryRuntimeError;
class MultipleError {
    errors;
    constructor(...errors) {
        this.errors = errors;
    }
    log() {
        for (const error of this.errors) {
            console.error(error);
        }
    }
}
exports.MultipleError = MultipleError;
