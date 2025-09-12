FROM oven/bun:1.2.13 AS builder
WORKDIR /app
COPY . .
RUN bun install
RUN bunx prisma generate
RUN bun run build

FROM oven/bun:1.2.13 AS production
WORKDIR /app
COPY --from=builder /app/package.json ./
COPY --from=builder /app/bun.lock ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000
CMD ["node", "./dist/index.js"]