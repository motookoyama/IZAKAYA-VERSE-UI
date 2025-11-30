FROM node:20-alpine

WORKDIR /app

# Copy local built assets (docs)
COPY docs ./docs

# Install 'serve' package globally (lightweight static server)
RUN npm install -g serve

# Expose port 1398
EXPOSE 1398
ENV PORT=1398

# Start server on port 1398, in SPA mode (-s)
CMD ["serve", "-s", "docs", "-l", "1398"]
