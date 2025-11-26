# Build stage
FROM node:20-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built assets from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom nginx config if needed (optional, using default for now but good to have placeholder)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Cloud Run requires listening on PORT environment variable
# Nginx default is 80, we can configure it to use $PORT or just map 8080
# Cloud Run defaults to 8080
EXPOSE 8080

# Overwrite default nginx config to listen on 8080 and handle SPA routing
RUN echo 'server { \
    listen 8080; \
    server_name localhost; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

CMD ["nginx", "-g", "daemon off;"]
