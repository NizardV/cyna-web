# Stage 1 : Build de l'application Node
FROM node:22-slim AS build
WORKDIR /app

# On copie uniquement les fichiers de dépendances pour mettre en cache cette étape
COPY package*.json ./

# On installe proprement TOUTES les dépendances (y compris Vite) dans le conteneur
RUN npm ci

# On copie le reste du code source
COPY . .

# On lance la compilation (le fameux npm run build qui va trouver Vite sans problème)
RUN npm run build

# Stage 2 : Serveur de production léger avec NGINX
FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]