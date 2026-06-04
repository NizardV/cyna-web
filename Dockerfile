# Stage 1 : Build de l'application React
FROM node:22-slim AS build
WORKDIR /app

# Copie des fichiers de dépendances
COPY package*.json ./
# ON REMPLACE "RUN npm ci" PAR LA LIGNE CI-DESSOUS :
RUN npm install --legacy-peer-deps

# Copie du reste du code source et build
COPY . .
RUN npm run build

# Stage 2 : Serveur de production avec NGINX
FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]