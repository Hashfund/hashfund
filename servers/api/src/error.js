"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatusError = void 0;
class StatusError {
    status;
    data;
    constructor(status, data) {
        this.status = status;
        this.data = data;
    }
}
exports.StatusError = StatusError;
