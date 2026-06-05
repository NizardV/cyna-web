# Stage 1 : Build de l'application Node
FROM node:22-slim AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2 : Serveur de production léger avec NGINX
FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html

# Config pour le routing côté client
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]