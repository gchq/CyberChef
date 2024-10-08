FROM node:18-alpine AS build

COPY . .
RUN npm ci
RUN npm run build

FROM nginx-unprivileged:1.25.2-alpine3.18 AS cyberchef

COPY --from=build ./build/prod /usr/share/nginx/html/
