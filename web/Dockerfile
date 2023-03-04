FROM node:16

WORKDIR /usr/app

COPY package*.json ./
COPY tsconfig.json ./
COPY webpack.config.ts ./
COPY .babelrc ./

COPY src ./src

RUN npm install

EXPOSE 8080

CMD [ "npm", "run", "build-serve" ]