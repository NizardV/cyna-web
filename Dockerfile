FROM node:22-slim AS build
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@latest --activate
COPY package*.json ./
COPY pnpm-lock.yaml ./
COPY .npmrc ./
RUN pnpm install --frozen-lockfile
COPY . .
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN pnpm run build

FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]