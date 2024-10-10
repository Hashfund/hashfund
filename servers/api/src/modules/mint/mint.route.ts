import type { z } from "zod";
import type { FastifyInstance, FastifyRequest } from "fastify";

import { StatusError } from "../../error";
import { selectMintSchema } from "../../db/zod";
import { orderByBuilder } from "../../utils/order";
import { catchRuntimeError } from "../../utils/error";
import {
  buildURLFromRequest,
  LimitOffsetPagination,
  limitOffsetPaginationSchema,
} from "../../utils/pagination";

import { mintQuery } from "./mint.query";
import { getMintById, getMints, getMintsByUser } from "./mint.controller";

const getMintsRoute = (
  request: FastifyRequest<{
    Querystring: z.infer<typeof limitOffsetPaginationSchema> &
      Record<string, string>;
  }>
) =>
  limitOffsetPaginationSchema
    .parseAsync(request.query)
    .then(async ({ limit, offset }) => {
      const pagination = new LimitOffsetPagination(
        buildURLFromRequest(request),
        limit,
        offset
      );
      return pagination.getResponse(
        await getMints(
          pagination.limit,
          pagination.getOffset(),
          mintQuery(request.query),
          orderByBuilder(request.query.orderBy)
        )
      );
    });

const getMintByIdRoute = (
  request: FastifyRequest<{
    Params: Pick<z.infer<typeof selectMintSchema>, "id">;
  }>
) =>
  selectMintSchema
    .pick({ id: true })
    .parseAsync(request.params)
    .then(async ({ id }) => {
      const mint = await getMintById(id);

      if (mint) return mint;

      throw new StatusError(404, { message: "mint with id not found." });
    });

const getMintByUserRoute = (
  request: FastifyRequest<{
    Params: Pick<z.infer<typeof selectMintSchema>, "id">;
    Querystring: z.infer<typeof limitOffsetPaginationSchema> &
      Record<string, string>;
  }>
) =>
  limitOffsetPaginationSchema
    .parseAsync(request.query)
    .then(({ limit, offset }) =>
      selectMintSchema
        .pick({ id: true })
        .parseAsync(request.params)
        .then(async ({ id }) => {
          const pagination = new LimitOffsetPagination(
            buildURLFromRequest(request),
            limit,
            offset
          );
          const mints = await getMintsByUser(
            id,
            pagination.limit,
            pagination.getOffset()
          );

          return pagination.getResponse(mints);
        })
    );

export const registerMintRoutes = (server: FastifyInstance) => {
  server
    .route({
      method: "GET",
      url: "/mints/",
      handler: catchRuntimeError(getMintsRoute),
    })
    .route({
      method: "GET",
      url: "/mints/:id/",
      handler: catchRuntimeError(getMintByIdRoute),
    })
    .route({
      method: "GET",
      url: "/mints/users/:id/",
      handler: catchRuntimeError(getMintByUserRoute),
    });
};
