# 1. Transpile the project
FROM node:lts as node

WORKDIR /app/frontend

COPY package.json yarn.lock .yarnrc /app/frontend/

# Set up the dependencies of the project
RUN yarn install --frozen-lockfile

# Copy the source files for the transpile
COPY tsconfig.aot.json webpack.aot.config.js /app/frontend/
COPY src/ /app/frontend/src

RUN yarn build:aot

# 2. Build the nginx image along with the built project
FROM nginx:alpine

COPY docker/nginx/nginx.conf /etc/nginx/nginx.conf.template
COPY --from=node /app/frontend/dist /usr/share/nginx/html

ENV BACKEND_HOST backend
ENV BACKEND_PORT 4000

COPY docker/nginx/docker-entrypoint.sh /
RUN ["chmod", "+x", "/docker-entrypoint.sh"]

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]

# Used because the nginx frontend acts as a reverse proxy to the backend
EXPOSE 4000