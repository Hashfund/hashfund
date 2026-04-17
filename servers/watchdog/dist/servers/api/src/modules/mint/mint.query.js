"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mintSearch = exports.mintQuery = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const schema_1 = require("../../db/schema");
const query_1 = require("../../utils/query");
const builder = {
    id: (0, query_1.mapFilters)(schema_1.mints.id),
    uri: (0, query_1.mapFilters)(schema_1.mints.uri),
    name: (0, query_1.mapFilters)(schema_1.mints.name),
    symbol: (0, query_1.mapFilters)(schema_1.mints.symbol),
    supply: (0, query_1.mapFilters)(schema_1.mints.supply),
    creator: (0, query_1.mapFilters)(schema_1.mints.creator),
    signature: (0, query_1.mapFilters)(schema_1.mints.signature),
    timestamp: (0, query_1.mapFilters)(schema_1.mints.timestamp),
};
exports.mintQuery = (0, query_1.queryBuilder)(builder);
exports.mintSearch = (() => {
    const query = (0, query_1.queryBuilder)(builder, drizzle_orm_1.or);
    return (search) => {
        search = "%" + search + "%";
        return query({
            id__like: search,
            uri__like: search,
            name__like: search,
            symbol__like: search,
            creator__like: search,
            signature__like: search,
        });
    };
})();
