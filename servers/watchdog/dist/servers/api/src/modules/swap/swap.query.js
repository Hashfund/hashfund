"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.swapQuery = void 0;
const schema_1 = require("../../db/schema");
const query_1 = require("../../utils/query");
exports.swapQuery = (0, query_1.queryBuilder)({
    mint: (0, query_1.mapFilters)(schema_1.swaps.mint),
    payer: (0, query_1.mapFilters)(schema_1.swaps.payer),
    timestamp: (0, query_1.mapFilters)(schema_1.swaps.timestamp),
    tradeDirection: (0, query_1.mapFilters)(schema_1.swaps.tradeDirection),
});
