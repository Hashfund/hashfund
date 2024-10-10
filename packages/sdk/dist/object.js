"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Omit = void 0;
const Omit = (Class, ...keys) => {
    for (const key of keys)
        delete Class["prototype"][key];
    return Class;
};
exports.Omit = Omit;
