FROM node:16 as builder
WORKDIR /web-ui
ARG TENANT_MANAGER_URL
COPY . .
RUN export VITE_API_DOMAIN="$TENANT_MANAGER_URL" && npm install && npm run build:ts-off

FROM nginx:1.21-alpine
COPY --from=builder /web-ui/dist /usr/share/nginx/html
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;", "-p", "8080"]
