# Production image: the built app served by Caddy. The Caddy config (routing, HTTPS, headers)
# comes from the backend repo's deploy/Caddyfile, see deploy/compose.yml there.

FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# The API is served on the same host under /api, so one build works for every environment
ENV VITE_API_BASE_URL=/api
RUN npm run build

FROM caddy:2-alpine
COPY --from=build /app/dist /srv
