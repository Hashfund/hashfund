"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageKitApi = void 0;
const impl_1 = require("./impl");
class ImageKitApi extends impl_1.ApiImpl {
    constructor() {
        super(...arguments);
        this.path = "/imagekit";
    }
    getAuthenticationParameters() {
        return this.xior.get(this.buildPath("auth"));
    }
}
exports.ImageKitApi = ImageKitApi;
