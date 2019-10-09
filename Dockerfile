# build a small nginx image with built app
FROM nginx

## Remove default nginx website
RUN rm -rf /usr/share/nginx/html/*

## From 'build' copy website to default nginx public folder
COPY ./build/prod /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
