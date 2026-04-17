# syntax = docker/dockerfile:1.2

FROM node:20-slim as base 

RUN apt-get update && apt-get install -y \
    build-essential python3 curl bash unzip \
    && rm -rf /var/lib/apt/lists/*

# Install Bun
RUN curl -fsSL https://bun.sh/install | bash
ENV PATH="/root/.bun/bin:${PATH}"

RUN npm install -g turbo@latest

FROM base as builder

WORKDIR /usr/src/app

COPY . .

RUN  turbo prune @hashfund/api --docker

FROM base as installer

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/out/json/ .
RUN --mount=type=cache,target=/root/.yarn YARN_CACHE_FOLDER=/root/.yarn yarn install --frozen-lockfile

COPY --from=builder /usr/src/app/out/full/ .
RUN turbo run build --filter=@hashfund/api

FROM base as runner 

WORKDIR /usr/src/app 

COPY --from=installer /usr/src/app/ .

WORKDIR /usr/src/app/servers/api

RUN npx --yes @fastify/secure-session > secret-key

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs
RUN chown -R nodejs:nodejs /usr/src/app/

ENV HOST=0.0.0.0
ENV PORT=10000

USER nodejs

EXPOSE 10000

CMD yarn drizzle-kit generate && yarn drizzle-kit migrate && node dist/servers/api/src/index.js
