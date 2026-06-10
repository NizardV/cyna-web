FROM node:22-slim AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Récupère l'URL API au moment du build
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build