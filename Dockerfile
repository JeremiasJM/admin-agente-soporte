FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# VITE_ADMIN_API_KEY se pasa como build arg en CI/CD
ARG VITE_ADMIN_API_KEY
ENV VITE_ADMIN_API_KEY=$VITE_ADMIN_API_KEY

RUN npm run build

# ---------------------------------------------------------------------------
# Runtime: servidor estático con nginx
# ---------------------------------------------------------------------------
FROM nginx:alpine AS runner

COPY --from=builder /app/dist /usr/share/nginx/html

# Configuración nginx para SPA (todas las rutas → index.html)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
