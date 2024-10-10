"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiImpl = void 0;
const path_1 = __importDefault(require("path"));
class ApiImpl {
    constructor(xior) {
        this.xior = xior;
        this.buildPath = (...paths) => {
            return path_1.default.join(this.path, ...paths.map(String));
        };
        this.buildPathWithQuery = (path, query) => {
            const q = new URLSearchParams(query);
            return path + "?" + q.toString();
        };
    }
}
exports.ApiImpl = ApiImpl;
