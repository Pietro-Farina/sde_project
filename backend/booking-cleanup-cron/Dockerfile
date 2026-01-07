# Use Node.js official image
FROM node:20-alpine

WORKDIR /app

COPY package.json ./
RUN npm install --production
COPY cleanupCron.js ./

CMD ["npm", "start"]
