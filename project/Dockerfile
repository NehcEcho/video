FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .

EXPOSE 1659
CMD ["npx", "vite", "--host", "0.0.0.0", "--port", "1659"]
