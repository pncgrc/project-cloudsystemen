FROM node:latest
WORKDIR /app
COPY . .
RUN npm install
RUN npm install -g typescript ts-node
EXPOSE 3000
CMD ["ts-node", "index.ts"]