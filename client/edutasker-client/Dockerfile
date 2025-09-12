FROM node:20-alpine AS base

FROM base AS installer
WORKDIR /installer

RUN mkdir -p /installer

COPY package.json ./

RUN npm install -g bun && bun install --frozen-lockfile || bun install
COPY . .
RUN bun run build

FROM base AS runner
WORKDIR /app
RUN addgroup --system --gid 1001 EduTasker
RUN adduser --system --uid 1001 EduTasker
USER EduTasker
COPY --from=installer --chown=EduTasker:EduTasker /installer/.next/standalone ./
COPY --from=installer --chown=EduTasker:EduTasker /installer/.next/static ./.next/static
COPY --from=installer --chown=EduTasker:EduTasker /installer/public ./public

ENTRYPOINT [ "node", "server.js" ]