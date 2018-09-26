FROM mhart/alpine-node:8.6.0
RUN apk update upgrade \
    && apk add openssh-client \
    autossh
RUN rm -rf /var/cache/apk/*
COPY ./app /opt/app
WORKDIR /opt/app
RUN npm i
ENTRYPOINT ["node", "index.js"]