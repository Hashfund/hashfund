"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderByBuilder = exports.Grammer = void 0;
const drizzle_orm_1 = require("drizzle-orm");
exports.Grammer = {
    desc: drizzle_orm_1.desc,
    asc: drizzle_orm_1.asc,
};
const orderByBuilder = (query) => {
    if (!query)
        return;
    const split = query.split("__");
    let by = undefined;
    let value = undefined;
    if (split.length > 1)
        [by, value] = split;
    else
        [value] = split;
    if (by && by in exports.Grammer)
        return exports.Grammer[by]((0, drizzle_orm_1.sql) `${value}`);
    else
        return (0, drizzle_orm_1.sql) `${value}`;
};
exports.orderByBuilder = orderByBuilder;
