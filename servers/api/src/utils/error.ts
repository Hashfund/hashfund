import { FastifyReply, FastifyRequest } from "fastify";
import { z, ZodError } from "zod";

export const catchRuntimeError =
  <TRequest extends FastifyRequest, TReply extends FastifyReply>(
    fn: (request: TRequest, reply: TReply) => Promise<any>
  ) =>
  async (request: TRequest, reply: TReply) =>
    fn(request, reply).catch((error) => {
      if (error instanceof ZodError)
        return reply.status(400).send(error.format());
      return reply.status(500).send(error);
    });
