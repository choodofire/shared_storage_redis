FROM node:18.15.0

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 50051

CMD ["npm", "start"]