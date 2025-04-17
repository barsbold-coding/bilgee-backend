# Dockerfile.dev
FROM node:23-alpine

WORKDIR /app

COPY package*.json ./

RUN yarn install

COPY . .

CMD ["yarn", "start:dev"]
