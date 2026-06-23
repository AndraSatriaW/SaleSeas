FROM node:22-alpine

WORKDIR /app

# Copy package files first to leverage Docker cache
COPY package*.json ./

RUN npm install

# Copy the rest of the code
COPY . .

# Start the service
CMD ["node", "index.js"]
