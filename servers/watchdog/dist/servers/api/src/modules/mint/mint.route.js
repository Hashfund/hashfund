"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerMintRoutes = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const error_1 = require("../../error");
const zod_1 = require("../../db/zod");
const order_1 = require("../../utils/order");
const error_2 = require("../../utils/error");
const pagination_1 = require("../../utils/pagination");
const mint_query_1 = require("./mint.query");
const mint_controller_1 = require("./mint.controller");
const getMintsRoute = (request) => pagination_1.limitOffsetPaginationSchema
    .parseAsync(request.query)
    .then(async ({ limit, offset }) => {
    const pagination = new pagination_1.LimitOffsetPagination((0, pagination_1.buildURLFromRequest)(request), limit, offset);
    let query = (0, mint_query_1.mintQuery)(request.query);
    if (request.query.search) {
        const search = (0, mint_query_1.mintSearch)(request.query.search);
        query = query ? (0, drizzle_orm_1.and)(query, search) : search;
    }
    return pagination.getResponse(await (0, mint_controller_1.getMints)(pagination.limit, pagination.getOffset(), query, (0, order_1.orderByBuilder)(request.query.orderBy)));
});
const getMintByIdRoute = (request) => zod_1.selectMintSchema
    .pick({ id: true })
    .parseAsync(request.params)
    .then(async ({ id }) => {
    const mint = await (0, mint_controller_1.getMintById)(id);
    if (mint)
        return mint;
    throw new error_1.StatusError(404, { message: "mint with id not found." });
});
const getMintByUserRoute = (request) => pagination_1.limitOffsetPaginationSchema
    .parseAsync(request.query)
    .then(({ limit, offset }) => zod_1.selectMintSchema
    .pick({ id: true })
    .parseAsync(request.params)
    .then(async ({ id }) => {
    const pagination = new pagination_1.LimitOffsetPagination((0, pagination_1.buildURLFromRequest)(request), limit, offset);
    const mints = await (0, mint_controller_1.getMintsByUser)(id, pagination.limit, pagination.getOffset());
    return pagination.getResponse(mints);
}));
const registerMintRoutes = (server) => {
    server
        .route({
        method: "GET",
        url: "/mints/",
        handler: (0, error_2.catchRuntimeError)(getMintsRoute),
    })
        .route({
        method: "GET",
        url: "/mints/:id/",
        handler: (0, error_2.catchRuntimeError)(getMintByIdRoute),
    })
        .route({
        method: "GET",
        url: "/mints/users/:id/",
        handler: (0, error_2.catchRuntimeError)(getMintByUserRoute),
    });
};
exports.registerMintRoutes = registerMintRoutes;
