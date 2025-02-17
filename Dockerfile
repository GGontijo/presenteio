FROM node

WORKDIR /app

COPY public/ ./public
COPY src/ ./src

COPY package.json .

RUN npm install

COPY . .

CMD ["npm", "run", "build"]
