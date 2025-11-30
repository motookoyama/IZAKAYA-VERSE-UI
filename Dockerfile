FROM node:20-alpine

WORKDIR /app

# Copy package files and install production dependencies (for server.js)
COPY package*.json ./
RUN npm ci --omit=dev

# Copy local built assets (docs) and server script
COPY docs ./docs
COPY server.cjs .

# Expose port 1398
EXPOSE 1398
ENV PORT=1398

# Start the Node server
CMD ["node", "server.cjs"]
