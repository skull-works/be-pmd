FROM node:latest

RUN mkdir -p /app/src

WORKDIR /app/src

COPY package.json .

RUN npm install

COPY . .

EXPOSE 9000

CMD ["npm","start"]