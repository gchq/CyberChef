FROM alpine:3.4

RUN addgroup cyberchef -S && \
    adduser cyberchef -G cyberchef -S && \
    apk update && \
    apk add git nodejs && \
    rm -rf /var/cache/apk/* && \
    npm install -g grunt-cli && \
    npm install -g http-server

COPY . /srv/CyberChef

RUN cd /srv/CyberChef && \
    rm -rf .git && \
    npm install && \
    npm cache rm && \
    apk del git && \
    chown -R cyberchef:cyberchef /srv/CyberChef && \
    grunt prod

WORKDIR /srv/CyberChef/build/prod
USER cyberchef
ENTRYPOINT ["http-server", "-p", "8000"]
