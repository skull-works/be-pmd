FROM node:latest

RUN mkdir -p /app/src

WORKDIR /app/src

COPY package.json .

RUN yarn install

COPY . .

EXPOSE 9000

CMD ["npm","start"]