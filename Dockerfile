FROM node:22-slim AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
ARG VITE_STRIPE_PUBLISHABLE_KEY
ENV VITE_STRIPE_PUBLISHABLE_KEY=$VITE_STRIPE_PUBLISHABLE_KEY
ARG VITE_APP_TITLE
ENV VITE_APP_TITLE=$VITE_APP_TITLE
ARG VITE_APP_DESCRIPTION
ENV VITE_APP_DESCRIPTION=$VITE_APP_DESCRIPTION

RUN npm run build

FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]