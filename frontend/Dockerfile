FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Expose Vite's default port
EXPOSE 5173

# Run Vite dev server and expose it to the Docker network
CMD ["npm", "run", "dev", "--", "--host"]
