"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerSwapRoutes = exports.getSwapsVolumeRoute = exports.getSwapsGraphRoute = exports.getSwapRoute = exports.getSwapsRoute = void 0;
const error_1 = require("../../error");
const zod_1 = require("../../db/zod");
const order_1 = require("../../utils/order");
const error_2 = require("../../utils/error");
const pagination_1 = require("../../utils/pagination");
const swap_query_1 = require("./swap.query");
const swap_controller_1 = require("./swap.controller");
const swap_schema_1 = require("./swap.schema");
const getSwapsRoute = (request) => pagination_1.limitOffsetPaginationSchema
    .parseAsync(request.query)
    .then(async ({ limit, offset }) => {
    const pagination = new pagination_1.LimitOffsetPagination((0, pagination_1.buildURLFromRequest)(request), limit, offset);
    const query = (0, swap_query_1.swapQuery)(request.query);
    const orderBy = (0, order_1.orderByBuilder)(request.query.orderBy);
    return pagination.getResponse(await (0, swap_controller_1.getSwaps)(pagination.limit, pagination.getOffset(), query, orderBy));
});
exports.getSwapsRoute = getSwapsRoute;
const getSwapRoute = (request) => zod_1.selectSwapSchema
    .pick({ id: true })
    .parseAsync(request.params)
    .then(async ({ id }) => {
    const swap = await (0, swap_controller_1.getSwapById)(id);
    if (swap)
        return swap;
    throw new error_1.StatusError(404, { message: "swap not found." });
});
exports.getSwapRoute = getSwapRoute;
const getSwapsGraphRoute = (request) => pagination_1.limitOffsetPaginationSchema
    .parseAsync(request.query)
    .then(async ({ limit, offset }) => swap_schema_1.graphSchema
    .parseAsync(request.query)
    .then(async ({ resolution, duration }) => {
    const pagination = new pagination_1.LimitOffsetPagination((0, pagination_1.buildURLFromRequest)(request), limit, offset);
    const filter = (0, swap_query_1.swapQuery)(request.query);
    return pagination.getResponse(await (0, swap_controller_1.getSwapsGraph)(pagination.limit, pagination.getOffset(), resolution, duration, filter));
}));
exports.getSwapsGraphRoute = getSwapsGraphRoute;
const getSwapsVolumeRoute = (request) => {
    const query = (0, swap_query_1.swapQuery)(request.query);
    return (0, swap_controller_1.getSwapsVolume)(query);
};
exports.getSwapsVolumeRoute = getSwapsVolumeRoute;
const registerSwapRoutes = (server) => {
    server
        .route({
        method: "GET",
        url: "/swaps/",
        handler: (0, error_2.catchRuntimeError)(exports.getSwapsRoute),
    })
        .route({
        method: "GET",
        url: "/swaps/:id/",
        handler: (0, error_2.catchRuntimeError)(exports.getSwapRoute),
    })
        .route({
        method: "GET",
        url: "/swaps/graph/",
        handler: (0, error_2.catchRuntimeError)(exports.getSwapsGraphRoute),
    })
        .route({
        method: "GET",
        url: "/swaps/volume/",
        handler: (0, error_2.catchRuntimeError)(exports.getSwapsVolumeRoute),
    });
};
exports.registerSwapRoutes = registerSwapRoutes;
