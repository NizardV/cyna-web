# Stage 1 : Build de l'application React
FROM node:20-alpine AS build
WORKDIR /app

# Copie des fichiers de dépendances
COPY package*.json ./
RUN npm ci

# Copie du reste du code source et build
COPY . .
RUN npm run build

# Stage 2 : Serveur de production ultra-léger avec NGINX
FROM nginx:stable-alpine
# Copie des fichiers compilés par Vite dans le dossier public de NGINX
COPY --from=build /app/dist /usr/share/nginx/html

# Exposition du port 80 (le port standard HTTP)
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]