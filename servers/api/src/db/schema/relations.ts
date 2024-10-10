import { relations } from "drizzle-orm";

import { mints } from "./mints";
import { users } from "./users";
import { swaps } from "./swaps";
import { boundingCurves } from "./boundingCurves";

export const usersRelations = relations(users, ({ many }) => ({
  mints: many(mints),
  swaps: many(swaps),
}));

export const mintsRelations = relations(mints, ({ one, many }) => ({
  creator: one(users, {
    fields: [mints.creator],
    references: [users.id],
  }),
  boundingCurve: one(boundingCurves, {
    fields: [mints.id],
    references: [boundingCurves.mint],
  }),
  swaps: many(swaps),
}));

export const swapsRelations = relations(swaps, ({ one }) => ({
  payer: one(users, {
    fields: [swaps.payer],
    references: [users.id],
  }),
  mint: one(mints, {
    fields: [swaps.mint],
    references: [mints.id],
  }),
}));
