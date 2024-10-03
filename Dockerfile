FROM node:22.8.0 as builder
WORKDIR /web-ui
ARG TENANT_MANAGER_URL
ARG DOCS_URL
COPY . .
RUN export VITE_API_DOMAIN="$TENANT_MANAGER_URL" && export VITE_DOCS_DOMAIN="$DOCS_URL" && npm install && npm run build:ts-off

FROM nginx:1.21-alpine
COPY --from=builder /web-ui/dist /usr/share/nginx/html
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;", "-p", "8080"]
