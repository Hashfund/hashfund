import type { z } from "zod";
import type { FastifyInstance, FastifyRequest } from "fastify";

import { StatusError } from "../../error";
import { selectSwapSchema } from "../../db/zod";
import { orderByBuilder } from "../../utils/order";
import { catchRuntimeError } from "../../utils/error";
import {
  buildURLFromRequest,
  LimitOffsetPagination,
  limitOffsetPaginationSchema,
} from "../../utils/pagination";

import { swapQuery } from "./swap.query";
import {
  getSwapById,
  getSwaps,
  getSwapsGraph,
  getSwapsVolume,
} from "./swap.controller";

export const getSwapsRoute = (
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
      const query = swapQuery(request.query);
      const orderBy = orderByBuilder(request.query.orderBy);
      return pagination.getResponse(
        await getSwaps(pagination.limit, pagination.getOffset(), query, orderBy)
      );
    });

export const getSwapRoute = (
  request: FastifyRequest<{
    Params: Pick<z.infer<typeof selectSwapSchema>, "id">;
  }>
) =>
  selectSwapSchema
    .pick({ id: true })
    .parseAsync(request.params)
    .then(async ({ id }) => {
      const swap = await getSwapById(id);
      if (swap) return swap;
      throw new StatusError(404, { message: "swap not found." });
    });

export const getSwapsGraphRoute = (
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
      const filter = swapQuery(request.query);
      return pagination.getResponse(
        await getSwapsGraph(pagination.limit, pagination.getOffset(), filter)
      );
    });

export const getSwapsVolumeRoute = (
  request: FastifyRequest<{ Querystring: Record<string, string> }>
) => {
  const query = swapQuery(request.query);
  return getSwapsVolume(query);
};

export const registerSwapRoutes = (server: FastifyInstance) => {
  server
    .route({
      method: "GET",
      url: "/swaps/",
      handler: catchRuntimeError(getSwapsRoute),
    })
    .route({
      method: "GET",
      url: "/swaps/:id/",
      handler: catchRuntimeError(getSwapRoute),
    })
    .route({
      method: "GET",
      url: "/swaps/graph/",
      handler: catchRuntimeError(getSwapsGraphRoute),
    })
    .route({
      method: "GET",
      url: "/swaps/volume/",
      handler: catchRuntimeError(getSwapsVolumeRoute),
    });
};
