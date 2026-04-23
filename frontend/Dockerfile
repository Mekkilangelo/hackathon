<<<<<<< HEAD
FROM node:20-slim AS builder
=======
# ── Build stage ───────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

>>>>>>> main
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

<<<<<<< HEAD
=======
# NEXT_PUBLIC_API_URL injecté au build
>>>>>>> main
ARG NEXT_PUBLIC_API_URL=http://localhost:3001/api
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN npm run build

<<<<<<< HEAD
# ── Production image ───────────────────────────────────────────────────────────
FROM node:20-slim AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static     ./.next/static
COPY --from=builder /app/public           ./public
=======
# ── Runtime stage ─────────────────────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Fichiers standalone Next.js
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
>>>>>>> main

EXPOSE 3000

CMD ["node", "server.js"]
