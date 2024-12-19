# Build stage
FROM node:22.8.0 as builder
WORKDIR /web-ui

# Define build arguments for environment variables
ARG TENANT_MANAGER_URL
ARG WEB_UI_URL
ARG DOCS_URL
ARG MOCK_AUDIT_ENABLED

# Set environment variables during the build process
ENV VITE_API_DOMAIN=$TENANT_MANAGER_URL
ENV VITE_APP_DOMAIN=$WEB_UI_URL
ENV VITE_DOCS_DOMAIN=$DOCS_URL
ENV VITE_WEBSITE_DOMAIN=$WEBSITE_URL
ENV VITE_MOCK_AUDIT_ROUTE=$MOCK_AUDIT_ENABLED

COPY . .
RUN npm install && npm run build:ts-off

# Final stage with HAProxy and Nginx
FROM haproxy:2.8-alpine

USER root

# Install Nginx and other dependencies
RUN apk add --no-cache \
    nginx \
    lua5.3 \
    lua5.3-socket \
    lua5.3-sec \
    lua5.3-cjson \
    ca-certificates

# Copy static files
COPY --from=builder /web-ui/dist /usr/share/web-ui/html

# Create required directories and set permissions
RUN mkdir -p /run/nginx && \
    mkdir -p /var/lib/nginx/tmp && \
    chown -R haproxy:haproxy /var/lib/nginx && \
    chown -R haproxy:haproxy /run/nginx

RUN ls -la /etc/nginx/mime.types

# Copy Nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

#COPY mime.types /etc/nginx/mime.types

# Switch back to haproxy user
USER haproxy

# Expose port 8080
EXPOSE 8080

# Start Nginx and HAProxy
CMD ["sh", "-c", "cat /etc/nginx/mime.types && nginx && haproxy -f /usr/local/etc/haproxy/haproxy.cfg"]
