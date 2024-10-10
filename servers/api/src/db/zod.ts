import { z } from "zod";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import { isAddress } from "../utils/web3";
import { users, mints, boundingCurves, swaps } from "./schema";

export const zIsAddress = z.custom<string>((value) => isAddress(value));
export const jsonMetadata = z.object({
  name: z.string(),
  image: z.string(),
  symbol: z.string(),
  description: z.string(),
});

export const selectUserSchema = createSelectSchema(users);
export const insertUserSchema = createInsertSchema(users);

export const selectMintSchema = createSelectSchema(mints);
export const insertMintSchema = createInsertSchema(mints, {
  uri: (schema) => schema.uri.url(),
  creator: zIsAddress,
  metadata: jsonMetadata,
});
export const updateMintSchema = insertMintSchema.omit({ id: true }).partial();

export const selectBoundingCurveSchema = createSelectSchema(boundingCurves);
export const insertBoundingCurveSchema = createInsertSchema(boundingCurves, {
  id: zIsAddress,
  mint: zIsAddress,
});

export const selectSwapSchema = createSelectSchema(swaps);
export const insertSwapSchema = createInsertSchema(swaps, {
  mint: zIsAddress,
  payer: zIsAddress,
});
