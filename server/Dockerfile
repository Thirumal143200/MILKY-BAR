FROM node:20-alpine AS builder

WORKDIR /app

# Enable corepack for pnpm/yarn if needed, we'll use npm
COPY package*.json ./
COPY packages/shared/package*.json ./packages/shared/
COPY server/package*.json ./server/

RUN npm install --workspaces --include-workspace-root

COPY . .

RUN npm run build --workspace=packages/shared
RUN npm run build --workspace=server

FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/shared ./packages/shared
COPY --from=builder /app/server/dist ./server/dist
COPY --from=builder /app/server/package.json ./server/

ENV NODE_ENV=production
ENV PORT=4000

EXPOSE 4000

CMD ["npm", "run", "start", "--workspace=server"]
