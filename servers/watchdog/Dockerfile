# syntax = docker/dockerfile:1.2

FROM node:22-slim as base

RUN apt-get update && apt-get install -y \
    build-essential python3 curl bash unzip \
    && rm -rf /var/lib/apt/lists/*

# Install Bun
RUN curl -fsSL https://bun.sh/install | bash
ENV PATH="/root/.bun/bin:${PATH}"

FROM base as builder

WORKDIR /usr/src/app

COPY . .

RUN  npx turbo prune watchdog --docker

FROM base as installer

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/out/json/ .
RUN --mount=type=cache,target=/root/.yarn YARN_CACHE_FOLDER=/root/.yarn yarn install --frozen-lockfile

COPY --from=builder /usr/src/app/out/full/ .
RUN npx turbo run build --filter=watchdog

FROM base as runner

WORKDIR /usr/src/app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs
USER nodejs

COPY --from=installer --chown=nodejs:nodejs /usr/src/app/ .

WORKDIR /usr/src/app/servers/watchdog

EXPOSE 10000

CMD node dist/main.js
