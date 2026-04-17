"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertSwapSchema = exports.selectSwapSchema = exports.insertBoundingCurveSchema = exports.selectBoundingCurveSchema = exports.updateMintSchema = exports.insertMintSchema = exports.selectMintSchema = exports.insertUserSchema = exports.selectUserSchema = exports.jsonMetadata = exports.zIsAddress = void 0;
const zod_1 = require("zod");
const drizzle_zod_1 = require("drizzle-zod");
const web3_1 = require("../utils/web3");
const schema_1 = require("./schema");
exports.zIsAddress = zod_1.z.custom((value) => (0, web3_1.isAddress)(value));
exports.jsonMetadata = zod_1.z.object({
    name: zod_1.z.string(),
    image: zod_1.z.string(),
    symbol: zod_1.z.string(),
    description: zod_1.z.string(),
});
exports.selectUserSchema = (0, drizzle_zod_1.createSelectSchema)(schema_1.users);
exports.insertUserSchema = (0, drizzle_zod_1.createInsertSchema)(schema_1.users);
exports.selectMintSchema = (0, drizzle_zod_1.createSelectSchema)(schema_1.mints);
exports.insertMintSchema = (0, drizzle_zod_1.createInsertSchema)(schema_1.mints, {
    uri: (schema) => schema.uri.url(),
    creator: exports.zIsAddress,
    metadata: exports.jsonMetadata,
});
exports.updateMintSchema = exports.insertMintSchema.omit({ id: true }).partial();
exports.selectBoundingCurveSchema = (0, drizzle_zod_1.createSelectSchema)(schema_1.boundingCurves);
exports.insertBoundingCurveSchema = (0, drizzle_zod_1.createInsertSchema)(schema_1.boundingCurves, {
    id: exports.zIsAddress,
    mint: exports.zIsAddress,
});
exports.selectSwapSchema = (0, drizzle_zod_1.createSelectSchema)(schema_1.swaps);
exports.insertSwapSchema = (0, drizzle_zod_1.createInsertSchema)(schema_1.swaps, {
    mint: exports.zIsAddress,
    payer: exports.zIsAddress,
});
