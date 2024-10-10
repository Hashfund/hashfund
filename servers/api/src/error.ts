import { HttpCodes } from "fastify/types/utils";

export class StatusError<T extends string | number | object> {
  constructor(readonly status: HttpCodes, readonly data: T) {}
}
