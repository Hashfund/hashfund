"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerUserRoutes = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const error_1 = require("../../error");
const order_1 = require("../../utils/order");
const error_2 = require("../../utils/error");
const zod_1 = require("../../db/zod");
const pagination_1 = require("../../utils/pagination");
const user_controller_1 = require("./user.controller");
const user_query_1 = require("./user.query");
const getUsersRoute = (request) => pagination_1.limitOffsetPaginationSchema
    .parseAsync(request.query)
    .then(async ({ limit, offset }) => {
    let query = (0, user_query_1.userQuery)(request.query);
    if (request.query.search) {
        let search = (0, user_query_1.userSearch)(request.query.search);
        query = query ? (0, drizzle_orm_1.and)(query, search) : search;
    }
    const orderBy = (0, order_1.orderByBuilder)(request.query.orderBy);
    const pagination = new pagination_1.LimitOffsetPagination((0, pagination_1.buildURLFromRequest)(request), limit, offset);
    return pagination.getResponse(await (0, user_controller_1.getUsers)(pagination.limit, pagination.getOffset(), query, orderBy, request.query.mint, request.query.tradeDirection !== undefined ? Number(request.query.tradeDirection) : undefined));
});
const getUserRoute = (request) => {
    switch (request.params.id) {
        default:
            return zod_1.selectUserSchema
                .pick({ id: true })
                .parseAsync(request.params)
                .then(async ({ id }) => {
                const user = await (0, user_controller_1.upsertUser)({ id });
                if (user)
                    return user;
                throw new error_1.StatusError(400, { message: "user not found." });
            });
    }
};
const updateUserRoute = (request) => {
    zod_1.insertUserSchema
        .omit({ id: true })
        .partial()
        .parseAsync(request.body)
        .then(async (body) => {
        return zod_1.selectUserSchema
            .pick({ id: true })
            .parseAsync(request.params)
            .then(async ({ id }) => {
            const user = await (0, user_controller_1.updateUserById)(id, body);
            if (user)
                return user;
            throw new error_1.StatusError(400, { message: "user not found." });
        });
    });
};
const registerUserRoutes = (server) => {
    server
        .route({
        method: "GET",
        url: "/users/",
        handler: (0, error_2.catchRuntimeError)(getUsersRoute),
    })
        .route({
        method: "GET",
        url: "/users/:id/",
        handler: (0, error_2.catchRuntimeError)(getUserRoute),
    })
        .route({
        method: "PATCH",
        url: "/users/:id/",
        handler: (0, error_2.catchRuntimeError)(updateUserRoute),
    });
};
exports.registerUserRoutes = registerUserRoutes;
