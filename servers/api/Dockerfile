# syntax = docker/dockerfile:1.2

FROM node:22-alpine3.19 as base 

RUN apk upgrade && \
    apk add libgcc libstdc++ && \ 
    apk add make gcc g++ python3

RUN yarn global add turbo

FROM base as builder

WORKDIR /usr/src/app

COPY . .

RUN  turbo prune @hashfund/api --docker

FROM base as installer

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/out/json/ .
RUN --mount=type=cache,target=/root/.yarn YARN_CACHE_FOLDER=/root/.yarn yarn install --frozen-lockfile

COPY --from=builder /usr/src/app/out/full/ .
RUN yarn turbo run build --filter=@hashfund/api

FROM base as runner 

WORKDIR /usr/src/app 

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs
USER nodejs

COPY --from=installer --chown=nodejs:nodejs /usr/src/app/ .

WORKDIR /usr/src/app/servers/api

RUN npx --yes @fastify/secure-session > secret-key

CMD yarn migrate && node dist/index.cjs
