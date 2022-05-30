FROM node:16-alpine AS builder

WORKDIR "/app"
COPY . .
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile
RUN pnpm run build
RUN pnpm prune --production

FROM node:16-alpine AS production
WORKDIR "/app"
COPY --from=builder /usr/local/lib/node_modules /usr/local/lib/node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
CMD [ "sh", "-c", "/usr/local/lib/node_modules/pnpm/bin/pnpm.cjs run start:prod"]
