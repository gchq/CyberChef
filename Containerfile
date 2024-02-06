FROM node:18-alpine AS build

COPY . .
RUN npm ci
RUN npm run build

FROM ghcr.io/static-web-server/static-web-server:2.25-alpine

COPY --from=build ./build/prod /public
