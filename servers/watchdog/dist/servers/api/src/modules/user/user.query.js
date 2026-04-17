"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userSearch = exports.userQuery = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const schema_1 = require("../../db/schema");
const query_1 = require("../../utils/query");
const builder = {
    id: (0, query_1.mapFilters)(schema_1.users.id),
    name: (0, query_1.mapFilters)(schema_1.users.name),
};
exports.userQuery = (0, query_1.queryBuilder)(builder);
exports.userSearch = (() => {
    const query = (0, query_1.queryBuilder)(builder, drizzle_orm_1.or);
    return (search) => {
        search = "%" + search + "%";
        return query({
            id__like: search,
            name__like: search,
        });
    };
})();
