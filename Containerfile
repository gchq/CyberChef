FROM ghcr.io/static-web-server/static-web-server:2.25-alpine

COPY ./build/prod /public
