"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildURLFromRequest = exports.LimitOffsetPagination = exports.limitOffsetPaginationSchema = void 0;
const zod_1 = require("zod");
const zNumber = zod_1.z
    .custom((input) => {
    const value = Number(input);
    return !Number.isNaN(value);
})
    .transform((value) => Number(value));
exports.limitOffsetPaginationSchema = zod_1.z.object({
    limit: zNumber.optional(),
    offset: zNumber.optional(),
});
class LimitOffsetPagination {
    url;
    static LIMIT = 16;
    static OFFSET = 0;
    limit;
    offset;
    constructor(url, limit, offset) {
        this.url = url;
        this.limit = limit ?? LimitOffsetPagination.LIMIT;
        this.offset = offset ?? LimitOffsetPagination.OFFSET;
    }
    nextURL() {
        const q = new URLSearchParams();
        q.append("limit", this.limit.toString());
        q.append("offset", (this.getOffset() + this.limit).toString());
        return new URL(this.url).href + "?" + q;
    }
    previousURL() {
        const q = new URLSearchParams();
        q.append("limit", this.limit.toString());
        q.append("offset", this.getOffset().toString());
        const href = new URL(this.url).href;
        return href + (href.endsWith("?") ? "?" : "") + q;
    }
    getResponse(results) {
        return {
            next: results.length > this.limit ? this.nextURL() : null,
            previous: this.offset > 0 ? this.previousURL() : null,
            results,
        };
    }
    getOffset() {
        return this.offset % this.limit > 0
            ? this.offset - (this.offset % this.limit)
            : this.offset;
    }
}
exports.LimitOffsetPagination = LimitOffsetPagination;
const buildURLFromRequest = (req) => req.protocol + "://" + req.hostname + req.originalUrl;
exports.buildURLFromRequest = buildURLFromRequest;
