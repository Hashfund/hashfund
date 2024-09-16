import { z } from "zod";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

import { zIsAddress } from "db/zod";
import { dateRangeSchema } from "utils/date";
import {
  buildURLFromRequest,
  LimitOffsetPagination,
  limitOffsetPaginationSchema,
} from "utils/pagination";
import {
  getAllSwapByMint,
  getAllSwaps,
  getUserSwapByMint,
} from "./swap.controller";
import { swapQuery } from "./swap.query";

const getAllSwapsRoute = async function (
  req: FastifyRequest<{
    Querystring: z.infer<typeof limitOffsetPaginationSchema> &
      Record<string, string>;
  }>
) {
  const { limit, offset, ...rest } = req.query;

  return limitOffsetPaginationSchema
    .parseAsync({ limit, offset })
    .then(async ({ limit, offset }) => {
      const paginator = new LimitOffsetPagination(
        buildURLFromRequest(req),
        limit,
        offset
      );
      return paginator.getResponse(
        await getAllSwaps(
          paginator.limit,
          paginator.getOffset(),
          swapQuery(rest)
        )
      );
    });
};

const getAllSwapByMintParamsSchema = z.object({
  mint: zIsAddress,
});

const getAllSwapsByMintQuerySchema =
  limitOffsetPaginationSchema.extend(dateRangeSchema);

const getAllSwapByMintRoute = async function (
  req: FastifyRequest<{
    Params: z.infer<typeof getAllSwapByMintParamsSchema>;
    Querystring: z.infer<typeof getAllSwapsByMintQuerySchema>;
  }>,
  reply: FastifyReply
) {
  return getAllSwapByMintParamsSchema
    .parseAsync(req.params)
    .then(({ mint }) => {
      return getAllSwapsByMintQuerySchema
        .parseAsync(req.query)
        .then(async ({ from, to, limit, offset }) => {
          const paginator = new LimitOffsetPagination(
            buildURLFromRequest(req),
            limit,
            offset
          );
          return paginator.getResponse(
            await getAllSwapByMint(
              mint,
              paginator.limit,
              paginator.getOffset(),
              from,
              to
            )
          );
        });
    })
    .catch((error) => reply.status(404).send(error));
};

const getUserSwapByMintParamsSchema = getAllSwapByMintParamsSchema.extend({
  user: zIsAddress,
});

const getUserSwapByMintRoute = async function (
  req: FastifyRequest<{
    Params: z.infer<typeof getUserSwapByMintParamsSchema>;
  }>
) {
  return getUserSwapByMintParamsSchema
    .parseAsync(req.params)
    .then((params) => getUserSwapByMint(params.mint, params.user).execute());
};

export const swapRoutes = (fastify: FastifyInstance) => {
  fastify
    .route({
      method: "GET",
      url: "/swaps/",
      handler: getAllSwapsRoute,
    })
    .route({
      method: "GET",
      url: "/swaps/:mint/",
      handler: getAllSwapByMintRoute,
    })
    .route({
      method: "GET",
      url: "/swaps/:mint/:user/",
      handler: getUserSwapByMintRoute,
    });
};
