#####################################
# Build the app to a static website #
#####################################
# Modifier --platform=$BUILDPLATFORM limits the platform to "BUILDPLATFORM" during buildx multi-platform builds
# This is because npm "chromedriver" package is not compatiable with all platforms
# For more info see: https://docs.docker.com/build/building/multi-platform/#cross-compilation
FROM --platform=$BUILDPLATFORM node:18-alpine AS builder

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
# We are using Github Actions: redhat-actions/buildah-build@v2 which needs manual selection of arch in base image
# Remove TARGETARCH if docker buildx is supported in the CI release as --platform=$TARGETPLATFORM will be automatically set
ARG TARGETARCH
ARG TARGETPLATFORM
FROM ${TARGETARCH}/nginx:stable-alpine AS cyberchef

COPY --from=builder /app/build/prod /usr/share/nginx/html/
