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
# --ignore-scripts do not run grunt postinstall script as it depends on files other than package.json
RUN npm ci --ignore-scripts

# Build the app
COPY . .

# npm postinstall runs grunt, which depends on files other than package.json
RUN npm run postinstall
RUN npm run build

#########################################
# Package static build files into nginx #
#########################################
FROM nginx:stable-alpine AS cyberchef

COPY --from=builder /app/build/prod /usr/share/nginx/html/
