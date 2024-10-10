"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SwapApi = exports.MintApi = exports.UserApi = void 0;
const xior_1 = __importDefault(require("xior"));
const crud_1 = require("./crud");
const object_1 = require("./object");
const imagekit_1 = require("./imagekit");
class UserApi extends crud_1.CrudApi {
    constructor() {
        super(...arguments);
        this.path = "users";
    }
    list(query) {
        return this.xior.get(this.buildPathWithQuery(this.path, query));
    }
}
exports.UserApi = UserApi;
class MintApi extends (0, object_1.Omit)((crud_1.CrudApi), "create", "update", "delete") {
    constructor() {
        super(...arguments);
        this.path = "mints";
    }
    getMintByUser(user) {
        return this.xior.get(this.buildPath("users", user));
    }
}
exports.MintApi = MintApi;
class SwapApi extends (0, object_1.Omit)((crud_1.CrudApi), "create", "update", "delete") {
    constructor() {
        super(...arguments);
        this.path = "swaps";
    }
    getSwapsGraph(query) {
        return this.xior.get(this.buildPathWithQuery(this.buildPath("graph"), query));
    }
    getSwapsVolume(query) {
        return this.xior.get(this.buildPathWithQuery(this.buildPath("volume"), query));
    }
}
exports.SwapApi = SwapApi;
class Api {
    constructor(baseURL, accessToken, flag = "web3auth") {
        const xiorInstance = xior_1.default.create({
            baseURL,
            headers: {
                Authorization: flag + " " + accessToken,
            },
        });
        this.user = new UserApi(xiorInstance);
        this.mint = new MintApi(xiorInstance);
        this.swap = new SwapApi(xiorInstance);
        this.imagekit = new imagekit_1.ImageKitApi(xiorInstance);
    }
}
exports.default = Api;
