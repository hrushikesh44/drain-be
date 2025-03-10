FROM node:20

WORKDIR usr/src/app

COPY . . 

RUN npm install

RUN npx tsc -b

EXPOSE 3000

CMD [ "node", "./dist/index.js" ]
