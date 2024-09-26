FROM nginx:latest
LABEL maintainer='David Goldenberg'
COPY ../build/prod  /usr/share/nginx/html