# Stage 1 : Build de l'application React
FROM node:22-slim AS build
WORKDIR /app

# On copie DIRECTEMENT tout le projet, y compris tes dépendances locales
COPY . .

# On vire npm install ! On build directement avec ce qui est sur ton PC
RUN npm run build

# Stage 2 : Serveur de production avec NGINX
FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]