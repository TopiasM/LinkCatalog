FROM node:16

WORKDIR /usr/app

COPY web/package*.json ./
COPY web/tsconfig.json ./
COPY web/webpack.config.ts ./
COPY web/.babelrc ./

COPY web/src ./src

RUN npm install

EXPOSE 8080

CMD [ "npm", "run", "build-serve" ]