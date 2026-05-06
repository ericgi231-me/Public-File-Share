FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY packages/react/package.json ./packages/react/
RUN npm ci --workspace=react
COPY packages/react ./packages/react/
WORKDIR /app/packages/react
RUN npm run build

FROM nginx:alpine AS production
COPY --from=builder /app/packages/react/dist /usr/share/nginx/html
COPY packages/react/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
RUN apk add --no-cache curl
HEALTHCHECK --interval=30s --timeout=5s --retries=3 CMD curl -f http://127.0.0.1/health || exit 1
CMD ["nginx", "-g", "daemon off;"]