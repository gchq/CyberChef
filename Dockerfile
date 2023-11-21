FROM node:20-alpine3.18 AS cyberchef-build

ENV NODE_OPTIONS="--max_old_space_size=2048"

WORKDIR /usr/src/app

COPY ./Gruntfile.js .
COPY ./webpack.config.js .
COPY ./package.json .
COPY ./package-lock.json .

RUN npm install

COPY . .

RUN npx grunt prod

RUN unzip build/prod/*.zip

FROM nginx:1.25-alpine3.18 AS cyberchef

WORKDIR /usr/share/nginx/html/

COPY --from=cyberchef-build /usr/src/app/build/prod/ .

RUN rm BundleAnalyzerReport.html
