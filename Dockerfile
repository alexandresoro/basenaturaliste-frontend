# 1. Transpile the project
FROM node:lts-alpine as node

WORKDIR /app/frontend

COPY package.json yarn.lock .yarnrc /app/frontend/

# Set up the dependencies of the project
RUN yarn install --frozen-lockfile

# Copy the source files for the transpile
COPY .eslintrc.json angular.json browserslist tsconfig.app.json tsconfig.json /app/frontend/
COPY src/ /app/frontend/src

RUN yarn build:prod

# 2. Build the webserver image along with the built project
FROM caddy

COPY docker/Caddyfile /etc/caddy/Caddyfile
COPY --from=node /app/frontend/dist /srv

ENV DOMAIN_URL http://localhost
ENV BACKEND_HOST backend
ENV BACKEND_PORT 4000

EXPOSE 80
EXPOSE 443