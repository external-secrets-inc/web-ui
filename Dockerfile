FROM node:22.8.0 as builder
WORKDIR /web-ui

# Define build arguments for environment variables
ARG TENANT_MANAGER_URL
ARG DOCS_URL
ARG NODE_ENV

# Set environment variables during the build process
ENV VITE_API_DOMAIN=$TENANT_MANAGER_URL
ENV VITE_DOCS_DOMAIN=$DOCS_URL
ENV NODE_ENV=$NODE_ENV

COPY . .
RUN npm install && npm run build:ts-off

FROM nginx:1.21-alpine
COPY --from=builder /web-ui/dist /usr/share/nginx/html
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;", "-p", "8080"]
