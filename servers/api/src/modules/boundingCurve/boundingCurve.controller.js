"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.upsertBoundingCurve = exports.updateBoundingCurveById = exports.createBoundingCurve = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const db_1 = require("../../db");
const schema_1 = require("../../db/schema");
const createBoundingCurve = (values) => db_1.db.insert(schema_1.boundingCurves).values(values).returning().execute();
exports.createBoundingCurve = createBoundingCurve;
const updateBoundingCurveById = (id, values, database = db_1.db) => database
    .update(schema_1.boundingCurves)
    .set(values)
    .where((0, drizzle_orm_1.eq)(schema_1.boundingCurves.id, id))
    .returning()
    .execute();
exports.updateBoundingCurveById = updateBoundingCurveById;
const upsertBoundingCurve = (values) => db_1.db
    .insert(schema_1.boundingCurves)
    .values(values)
    .onConflictDoUpdate({ target: [schema_1.boundingCurves.id], set: values })
    .returning()
    .execute();
exports.upsertBoundingCurve = upsertBoundingCurve;
