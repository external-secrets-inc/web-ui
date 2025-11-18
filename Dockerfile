# Build stage
FROM node:24.11.1 as builder
WORKDIR /web-ui


# Set environment variables to placeholders for the build process
ENV VITE_API_DOMAIN=__TENANT_MANAGER_URL__
ENV VITE_APP_DOMAIN=__WEB_UI_URL__
ENV VITE_DOCS_DOMAIN=__DOCS_URL__
ENV VITE_WEBSITE_DOMAIN=__WEBSITE_URL__
ENV VITE_MOCK_AUDIT_ROUTE=__MOCK_AUDIT_ENABLED__
ENV VITE_AUDIT_POC_DOMAIN=__AUDIT_BACKEND_URL__
ENV VITE_ESO_SERVER_DOMAIN=__ESO_SERVER_URL__

COPY . .
RUN npm install && npm run build:ts-off

# Final stage with HAProxy and Nginx
FROM haproxy:3.2-alpine

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

# Give haproxy user ownership of the static files to allow modification at startup
RUN chown -R haproxy:haproxy /usr/share/web-ui/html

# Create required directories and set permissions
RUN mkdir -p /run/nginx && \
    mkdir -p /var/lib/nginx/tmp && \
    chown -R haproxy:haproxy /var/lib/nginx && \
    chown -R haproxy:haproxy /run/nginx

RUN ls -la /etc/nginx/mime.types

# Copy Nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

#COPY mime.types /etc/nginx/mime.types

# Copy the entrypoint script and make it executable
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Switch back to haproxy user
USER haproxy

# Expose port 8080
EXPOSE 8080

# Set the entrypoint to our script
ENTRYPOINT ["/entrypoint.sh"]

# Start Nginx and HAProxy via the entrypoint
CMD ["sh", "-c", "nginx && haproxy -f /usr/local/etc/haproxy/haproxy.cfg"]
