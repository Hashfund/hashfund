import type { z } from "zod";
import type { FastifyInstance, FastifyRequest } from "fastify";

import { StatusError } from "../../error";
import { orderByBuilder } from "../../utils/order";
import { catchRuntimeError } from "../../utils/error";
import { insertUserSchema, selectUserSchema } from "../../db/zod";
import {
  buildURLFromRequest,
  LimitOffsetPagination,
  limitOffsetPaginationSchema,
} from "../../utils/pagination";

import { getUsers, updateUserById, upsertUser } from "./user.controller";

import { userQuery } from "./user.query";

const getUsersRoute = (
  request: FastifyRequest<{
    Querystring: z.infer<typeof limitOffsetPaginationSchema> &
      Record<string, string>;
  }>
) =>
  limitOffsetPaginationSchema
    .parseAsync(request.query)
    .then(async ({ limit, offset }) => {
      const query = userQuery(request.query);
      const orderBy = orderByBuilder(request.query.orderBy);
      const pagination = new LimitOffsetPagination(
        buildURLFromRequest(request),
        limit,
        offset
      );
      return pagination.getResponse(
        await getUsers(pagination.limit, pagination.getOffset(), query, orderBy)
      );
    });

const getUserRoute = (
  request: FastifyRequest<{
    Params: Pick<z.infer<typeof selectUserSchema>, "id">;
  }>
) => {
  switch (request.params.id) {
    default:
      return selectUserSchema
        .pick({ id: true })
        .parseAsync(request.params)
        .then(async ({ id }) => {
          const user = await upsertUser({ id });
          if (user) return user;
          throw new StatusError(400, { message: "user not found." });
        });
  }
};

const updateUserRoute = (
  request: FastifyRequest<{
    Params: Pick<z.infer<typeof selectUserSchema>, "id">;
    Body: Partial<z.infer<typeof insertUserSchema>>;
  }>
) => {
  insertUserSchema
    .omit({ id: true })
    .partial()
    .parseAsync(request.body)
    .then(async (body) => {
      return selectUserSchema
        .pick({ id: true })
        .parseAsync(request.params)
        .then(async ({ id }) => {
          const user = await updateUserById(id, body);
          if (user) return user;
          throw new StatusError(400, { message: "user not found." });
        });
    });
};

export const registerUserRoutes = (server: FastifyInstance) => {
  server
    .route({
      method: "GET",
      url: "/users/",
      handler: catchRuntimeError(getUsersRoute),
    })
    .route({
      method: "GET",
      url: "/users/:id/",
      handler: catchRuntimeError(getUserRoute),
    })
    .route({
      method: "PATCH",
      url: "/users/:id/",
      handler: catchRuntimeError(updateUserRoute),
    });
};
