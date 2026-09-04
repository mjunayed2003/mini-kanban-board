FROM node:20-alpine

WORKDIR /app

# Install dependencies first (better layer caching)
COPY package*.json ./
RUN npm install

# Copy prisma schema separately so `prisma generate` can run early if needed
COPY prisma ./prisma

# Copy the rest of the app
COPY . .

EXPOSE 4000

CMD ["npm", "run", "start:dev"]
