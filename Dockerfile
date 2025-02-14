FROM node:18-alpine AS build

COPY . .
RUN npm ci
RUN npm run build

FROM nginxinc/nginx-unprivileged:1.25.1-alpine3.18 AS cyberchef

COPY --from=build ./build/prod /usr/share/nginx/html/
