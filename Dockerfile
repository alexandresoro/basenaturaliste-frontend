FROM node:lts as node

WORKDIR /app/basenaturaliste-frontend

COPY basenaturaliste-model/ /app/basenaturaliste-model/
COPY basenaturaliste-frontend/package.json basenaturaliste-frontend/tsconfig.aot.json basenaturaliste-frontend/yarn.lock basenaturaliste-frontend/.yarnrc /app/basenaturaliste-frontend/

RUN yarn install

COPY basenaturaliste-frontend/webpack.aot.config.js /app/basenaturaliste-frontend/
COPY basenaturaliste-frontend/src/ /app/basenaturaliste-frontend/src

RUN yarn build:aot

FROM nginx:alpine

COPY basenaturaliste-frontend/docker/nginx/nginx.conf /etc/nginx/nginx.conf.template
COPY --from=node /app/basenaturaliste-frontend/dist /usr/share/nginx/html

ENV BACKEND_HOST backend
ENV BACKEND_PORT 4000

COPY basenaturaliste-frontend/docker/nginx/docker-entrypoint.sh /
RUN ["chmod", "+x", "/docker-entrypoint.sh"]

RUN /usr/bin/env sh

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]

# Used because the nginx frontend acts as a reverse proxy to the backend
EXPOSE 4000