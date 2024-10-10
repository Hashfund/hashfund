import { ZodError } from "zod";
import type { FastifyReply, FastifyRequest } from "fastify";
import { safeStringify } from "./object";

export const catchRuntimeError =
  <TRequest extends FastifyRequest, TReply extends FastifyReply>(
    fn: (request: TRequest, reply: TReply) => Promise<unknown> | unknown
  ) =>
  async (request: TRequest, reply: TReply) =>
    Promise.all([fn(request, reply)])
      .then(safeStringify)
      .then(([result]) => result)
      .catch((error) => {
        if (error instanceof ZodError)
          return reply.status(400).send(error.format());
        return reply.status(500).send(error);
      });
