import { z } from "zod";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import { isAddress } from "../utils/web3";

import { hashes } from "./schema/hash";
import { users, mints, boundingCurves, swaps } from "./schema";

export const zIsAddress = z.custom<string>((value) => isAddress(value));

export const selectUserSchema = createSelectSchema(users);
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

export const selectMintSchema = createSelectSchema(mints);
export const insertMintSchema = createInsertSchema(mints, {
  uri: (schema) => schema.uri.url(),
  creator: zIsAddress,
  reserve: zIsAddress,
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

export const hashSchema = createSelectSchema(hashes);
export const insertHashSchema = createInsertSchema(hashes, {
  marketId: zIsAddress.optional(),
  ammId: zIsAddress,
});
