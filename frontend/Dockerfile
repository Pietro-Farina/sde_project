FROM node:25.2.1-alpine

WORKDIR /app

COPY package.json ./

# Install dependencies including devDependencies (needed for build)
RUN npm install --include=dev

COPY . .

RUN npm run build

EXPOSE 5173

CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "5173"]