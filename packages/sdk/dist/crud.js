"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrudApi = void 0;
const impl_1 = require("./impl");
class CrudApi extends impl_1.ApiImpl {
    retrieve(id) {
        return this.xior.get(this.buildPath(id));
    }
    list(query) {
        return this.xior.get(this.buildPathWithQuery(this.path, query));
    }
    create(values) {
        return this.xior.post(this.path, values);
    }
    update(id, values) {
        return this.xior.patch(this.buildPath(id), values);
    }
    delete(id) {
        return this.xior.delete(this.buildPath(id));
    }
}
exports.CrudApi = CrudApi;
