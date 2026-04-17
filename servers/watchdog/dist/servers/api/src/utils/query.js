"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.queryBuilder = exports.mapFilters = exports.Grammer = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const normalize_1 = require("./normalize");
exports.Grammer = {
    eq: drizzle_orm_1.eq,
    lt: drizzle_orm_1.lt,
    lte: drizzle_orm_1.lte,
    gt: drizzle_orm_1.gt,
    gte: drizzle_orm_1.gte,
    like: drizzle_orm_1.like,
    ne: drizzle_orm_1.ne,
};
const mapFilters = function (column) {
    return (filters, value) => {
        const queries = [];
        if (filters.length === 0)
            return (0, drizzle_orm_1.eq)(column, (0, normalize_1.normalizeValue)(column, value));
        for (const filter of filters) {
            if (filter in exports.Grammer) {
                const grammer = exports.Grammer[filter](column, (0, normalize_1.normalizeValue)(column, value));
                queries.push(grammer);
            }
            else
                queries.push((0, drizzle_orm_1.eq)(column, value));
        }
        if (queries.length > 0)
            return (0, drizzle_orm_1.or)(...queries);
        return queries.at(0);
    };
};
exports.mapFilters = mapFilters;
const queryBuilder = (builder, condition = drizzle_orm_1.and) => {
    return (query) => {
        const sqlWrappers = [];
        for (const [key, value] of Object.entries(query)) {
            const [column, ...filters] = key.split("__");
            if (column in builder) {
                const results = builder[column](filters, value);
                sqlWrappers.push(results);
            }
        }
        if (sqlWrappers.length > 0)
            return condition(...sqlWrappers);
        return sqlWrappers.at(0);
    };
};
exports.queryBuilder = queryBuilder;
