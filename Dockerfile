# STAGE 1: Dependencies
FROM node:20-alpine AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# STAGE 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client (Matching the container's OS)
RUN npx prisma generate

# Build Next.js (Tailwind 4 CSS is compiled here)
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# STAGE 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy public assets
COPY --from=builder /app/public ./public

# 🚀 The Standalone Magic:
# We only copy the standalone folder and the static assets.
# This folder already contains the necessary node_modules and your Prisma Client.
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3001
ENV PORT 3001

# Start using the standalone server.js
CMD ["node", "server.js"]