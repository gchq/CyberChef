#####################################
# Build the app to a static website #
#####################################
# Modifier --platform=$BUILDPLATFORM limits the platform to "BUILDPLATFORM" during buildx multi-platform builds
# This is because npm "chromedriver" package is not compatiable with all platforms
# For more info see: https://docs.docker.com/build/building/multi-platform/#cross-compilation
FROM --platform=$BUILDPLATFORM node:24-alpine@sha256:ebfe2f90462722a7a4de65e91990e97fe0d401c70e0e762c5b53302f905ec1c1 AS builder

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
FROM nginxinc/nginx-unprivileged:stable-alpine@sha256:9b87ad3dd9f431c733f19dfb278c7eb3dba9dca381942c79818bb42f1a566a83 AS cyberchef

LABEL maintainer="GCHQ <oss@gchq.gov.uk>"

COPY --from=builder /app/build/prod /usr/share/nginx/html/
