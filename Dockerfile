ARG NX_CLOUD_ACCESS_TOKEN

# --- Base Image ---
FROM node:22.13.1-bullseye-slim AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable \
  && mkdir -p /pnpm /app \
  && chown -R node:node /pnpm /app

WORKDIR /app
USER node

# --- Build Image ---
FROM base AS build
ARG NX_CLOUD_ACCESS_TOKEN

COPY --chown=node:node package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY --chown=node:node tools/prisma ./tools/prisma
RUN pnpm install --frozen-lockfile

COPY --chown=node:node . .

ENV NX_CLOUD_ACCESS_TOKEN=$NX_CLOUD_ACCESS_TOKEN

RUN pnpm run build

# --- Release Image ---
FROM base AS release

USER root
RUN apt-get update \
  && apt-get install --no-install-recommends -y dumb-init \
  && rm -rf /var/lib/apt/lists/*
USER node

COPY --chown=node:node package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY --chown=node:node tools/prisma ./tools/prisma
RUN pnpm install --prod --frozen-lockfile

COPY --chown=node:node --from=build /app/dist ./dist
RUN pnpm run prisma:generate

ENV TZ=UTC
ENV PORT=3000
ENV NODE_ENV=production

EXPOSE 3000

CMD ["dumb-init", "pnpm", "run", "start"]
