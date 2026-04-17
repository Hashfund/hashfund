"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.last = exports.first = exports.interval = exports.extract = exports.coalesce = exports.date = exports.hour = exports.add = exports.sub = exports.caseWhen = exports.toBigInt = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const error_1 = require("../error");
const toBigInt = (column) => (0, drizzle_orm_1.sql) `('x' || lpad(${column}, 16, '0'))::bit(64)::bigint`;
exports.toBigInt = toBigInt;
const caseWhen = (when, then, or) => or
    ? (0, drizzle_orm_1.sql) `case when ${when} then ${then} else ${or} end`
    : (0, drizzle_orm_1.sql) `case when ${when} then ${then} end`;
exports.caseWhen = caseWhen;
const sub = (a, b) => (0, drizzle_orm_1.sql) `${a} - ${b}`;
exports.sub = sub;
const add = (a, b) => (0, drizzle_orm_1.sql) `coalesce(${a}, 0) + coalesce(${b}, 0)`;
exports.add = add;
const hour = (column) => (0, drizzle_orm_1.sql) `date_part('hour', ${column})`;
exports.hour = hour;
const date = (column) => (0, drizzle_orm_1.sql) `date(${column})`;
exports.date = date;
const coalesce = (exp, value) => (0, drizzle_orm_1.sql) `COALESCE(${exp}, ${value})`;
exports.coalesce = coalesce;
const extract = (value, column) => {
    switch (value.toUpperCase()) {
        case "MINUTE":
            return (0, drizzle_orm_1.sql) `EXTRACT(minutes FROM ${column})`;
        case "HOUR":
            return (0, drizzle_orm_1.sql) `EXTRACT(hour FROM ${column})`;
        case "YEAR":
            return (0, drizzle_orm_1.sql) `EXTRACT(year FROM ${column})`;
        default:
            throw new error_1.StatusError(404, "Invalid interval expect second, minute, hour, day, month, year.");
    }
};
exports.extract = extract;
const interval = (unit, duration, column) => {
    switch (unit.toUpperCase()) {
        case "SECOND":
            return (0, drizzle_orm_1.sql) `date_trunc('minute', ${column} + INTERVAL '1 second' * (FLOOR(EXTRACT(SECOND FROM ${column}) / ${duration}) * ${duration}))`;
        case "MINUTE":
            return (0, drizzle_orm_1.sql) `date_trunc('hour', ${column} + INTERVAL '1 minute' * (FLOOR(EXTRACT(MINUTE FROM ${column}) / ${duration}) * ${duration}))`;
        case "HOUR":
            return (0, drizzle_orm_1.sql) `date_trunc('day', ${column} + INTERVAL '1 hour' * (FLOOR(EXTRACT(HOUR FROM ${column}) / ${duration}) * ${duration}))`;
        case "DAY":
            return (0, drizzle_orm_1.sql) `date_trunc('month', ${column} + INTERVAL '1 day' * (FLOOR(EXTRACT(DAY FROM ${column}) / ${duration}) * ${duration}))`;
        case "MONTH":
            return (0, drizzle_orm_1.sql) `date_trunc('year', ${column} + INTERVAL '1 month' * (FLOOR(EXTRACT(MONTH FROM ${column}) / ${duration}) * ${duration}))`;
        case "YEAR":
            return (0, drizzle_orm_1.sql) `date_trunc('year', ${column} + INTERVAL '1 year' * (FLOOR(EXTRACT(YEAR FROM ${column}) / ${duration}) * ${duration}))`;
        default:
            throw new error_1.StatusError(404, "Invalid interval expect second, minute, hour, day, month, year.");
    }
};
exports.interval = interval;
const first = (column) => (0, drizzle_orm_1.sql) `first(${column})`;
exports.first = first;
const last = (column) => (0, drizzle_orm_1.sql) `last(${column})`;
exports.last = last;
