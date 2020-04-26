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

# 2. Build the nginx image along with the built project
FROM nginx:alpine

COPY docker/nginx/docker-entrypoint.sh /

COPY docker/nginx/nginx.conf /etc/nginx/nginx.conf.template
COPY --from=node /app/frontend/dist /usr/share/nginx/html

ENV BACKEND_HOST backend
ENV BACKEND_PORT 4000

RUN ["chmod", "+x", "/docker-entrypoint.sh"]

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
