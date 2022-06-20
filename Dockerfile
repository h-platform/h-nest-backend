FROM node:16-alpine AS node-module-installer
WORKDIR "/app"
COPY ./package.json .
COPY ./package-lock.json .
RUN npm ci
RUN tar -cf node_modules.tar node_modules



FROM node:16-alpine AS builder
WORKDIR "/app"
COPY --from=node-module-installer /app/node_modules.tar ./node_modules.tar
COPY --from=node-module-installer /app/package.json ./package.json
COPY --from=node-module-installer /app/package-lock.json ./package-lock.json
RUN tar -xf node_modules.tar
COPY . .
RUN npm run build
RUN npm prune --production



FROM node:16-alpine AS production
WORKDIR "/app"
COPY --from=node-module-installer /app/node_modules.tar ./node_modules.tar
COPY --from=node-module-installer /app/package.json ./package.json
COPY --from=node-module-installer /app/package-lock.json ./package-lock.json
RUN tar -xf node_modules.tar
COPY --from=builder /app/dist ./dist
CMD [ "sh", "-c", "npm run start:prod"]
