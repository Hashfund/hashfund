# syntax = docker/dockerfile:1.2

FROM node:22-alpine3.19 as base 

RUN apk update && \
    apk add libc6-compat alpine-sdk && \
    apk add make gcc g++ python3

RUN yarn global add turbo

FROM base AS deps

WORKDIR /usr/src/app

COPY . .
COPY /packages/chart/charting_library/bundles /www/web/public/bundles


RUN turbo prune web --docker

FROM base as builder

WORKDIR /usr/src/app

COPY --from=deps /usr/src/app/out/json/ .
RUN --mount=type=cache,target=/root/.yarn YARN_CACHE_FOLDER=/root/.yarn yarn install --frozen-lockfile

COPY --from=deps /usr/src/app/out/full/ .
RUN yarn turbo run build --filter=web

FROM base as runner 

WORKDIR /usr/src/app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

COPY --from=builder --chown=nextjs:nodejs  /usr/src/app/www/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs  /usr/src/app/www/web/.next/static ./www/web/.next/static
COPY --from=builder --chown=nextjs:nodejs /usr/src/app/www/web/public ./www/web/public

ENV NODE_ENV=production
ENV HOSTNAME="0.0.0.0"

CMD  node www/web/server.js