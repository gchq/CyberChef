FROM node:dubnium-buster-slim
RUN apt-get update && apt-get install -y build-essential && rm -rf /var/lib/apt/lists/*

COPY . /
ENV NODE_OPTIONS="--max_old_space_size=2048"
RUN npm install node-sass
RUN npm install -g grunt-cli
RUN npm i
CMD grunt dev   
