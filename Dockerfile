#####################################
# Build the app to a static website #
#####################################
# Modifier --platform=$BUILDPLATFORM limits the platform to "BUILDPLATFORM" during buildx multi-platform builds
# This is because npm "chromedriver" package is not compatiable with all platforms
# For more info see: https://docs.docker.com/build/building/multi-platform/#cross-compilation
FROM --platform=$BUILDPLATFORM node:24-alpine@sha256:156b55f92e98ccd5ef49578a8cea0df4679826564bad1c9d4ef04462b9f0ded6 AS builder

WORKDIR /app

COPY package.json .
COPY package-lock.json .

# Install dependencies
# --ignore-scripts prevents postinstall script (which runs grunt) as it depends on files other than package.json
RUN npm ci --ignore-scripts

# Copy files needed for postinstall and build
COPY . .

# npm postinstall runs grunt, which depends on files other than package.json
RUN npm run postinstall

# Build the app
RUN npm run build

#########################################
# Package static build files into nginx #
#########################################
FROM nginxinc/nginx-unprivileged:stable-alpine@sha256:fafa1102c789119971b3d83f9293f1ef5526bc73583a12e13ff5cd1299ed8b6c AS cyberchef

LABEL maintainer="GCHQ <oss@gchq.gov.uk>"

COPY --from=builder /app/build/prod /usr/share/nginx/html/
