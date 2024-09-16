import { FastifyInstance, FastifyRequest } from "fastify";
import { getHashes } from "./hash.controller";
import {
  buildURLFromRequest,
  LimitOffsetPagination,
  LimitOffsetPaginationQuery,
  limitOffsetPaginationSchema,
} from "utils/pagination";

function getHashesRoute(
  req: FastifyRequest<{ Querystring: LimitOffsetPaginationQuery }>
) {
  return limitOffsetPaginationSchema.parseAsync(req.query).then((query) => {
    const paginator = new LimitOffsetPagination(
      buildURLFromRequest(req),
      query.limit,
      query.offset
    );
    return getHashes(paginator.limit, paginator.getOffset());
  });
}

export const hashesRoutes = function (fastify: FastifyInstance) {
  fastify.route({
    method: "GET",
    url: "/hashes/",
    handler: getHashesRoute,
  });
};
