import type { z } from "zod";
import type { selectUserSchema } from "./db/zod";

type User = z.infer<typeof selectUserSchema>;

declare module "fastify" {
  interface PassportUser extends User {}
}
