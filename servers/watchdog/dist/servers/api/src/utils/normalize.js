"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeValue = exports.normalizeNumber = exports.normalizeBoolean = void 0;
const moment_1 = __importDefault(require("moment"));
const error_1 = require("../error");
const normalizeBoolean = (column, value) => {
    if (Number.isNaN(Number(value))) {
        switch (value) {
            case "true":
                return true;
            case "false":
                return false;
            default:
                throw new error_1.StatusError(400, {
                    message: "expected a truthy value for " + column.name,
                });
        }
    }
    else
        return Boolean(Number(value));
};
exports.normalizeBoolean = normalizeBoolean;
const normalizeNumber = (column, input) => {
    const value = Number(input);
    if (Number.isNaN(value))
        throw new error_1.StatusError(400, {
            message: "number expected for " + column.name,
        });
};
exports.normalizeNumber = normalizeNumber;
const normalizeValue = (column, value) => {
    switch (column.dataType) {
        case "bigint":
            return BigInt(value);
        case "date":
            return (0, moment_1.default)(value).toDate();
        case "boolean":
            return (0, exports.normalizeBoolean)(column, value);
        case "json":
            throw new error_1.StatusError(400, "json not supported as filter.");
        case "number":
            return (0, exports.normalizeNumber)(column, value);
        case "custom":
        case "string":
            return value;
        case "array":
            throw new error_1.StatusError(500, "array not supported as filter.");
        case "buffer":
            throw new error_1.StatusError(500, "buffer not supported as filter.");
    }
};
exports.normalizeValue = normalizeValue;
