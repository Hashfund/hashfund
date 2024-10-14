import { z } from "zod";
import { eq } from "drizzle-orm";

import { db } from "../../db";
import { boundingCurves } from "../../db/schema";
import { insertBoundingCurveSchema } from "../../db/zod";

export const createBoundingCurve = (
  values: z.infer<typeof insertBoundingCurveSchema>
) => db.insert(boundingCurves).values(values).returning().execute();

export const updateBoundingCurveById = (
  id: string,
  values: Partial<z.infer<typeof insertBoundingCurveSchema>>,
  database = db
) =>
  database
    .update(boundingCurves)
    .set(values)
    .where(eq(boundingCurves.id, id))
    .returning()
    .execute();

export const upsertBoundingCurve = (
  values: z.infer<typeof insertBoundingCurveSchema>
) =>
  db
    .insert(boundingCurves)
    .values(values)
    .onConflictDoUpdate({ target: [boundingCurves.id], set: values })
    .returning()
    .execute();
