FROM node:alpine

WORKDIR /express-docker

COPY . .

RUN npm install

CMD [ "npm", "start" ]

EXPOSE 5000
