FROM nginx:alpine

# Copy local built assets directly
COPY docs /usr/share/nginx/html

# Cloud Run requires listening on PORT environment variable
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
