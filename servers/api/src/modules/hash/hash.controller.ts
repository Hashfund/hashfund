import { z } from "zod";
import { eq, SQL } from "drizzle-orm";

import { db } from "../../db";
import { mints } from "../../db/schema";
import { hashes } from "../../db/schema/hash";
import type { insertHashSchema } from "../../db/zod";

export const createHash = function (values: z.infer<typeof insertHashSchema>) {
  return db.insert(hashes).values(values).returning().execute();
};

export const getHashes = function (limit: number, offset: number, where?: SQL) {
  return db
    .select()
    .from(hashes)
    .limit(limit)
    .offset(offset)
    .leftJoin(mints, eq(hashes.mint, mints.id))
    .where(where);
};
