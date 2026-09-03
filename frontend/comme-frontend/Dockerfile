# ==============================================================================
# Stage 1: Build React Application
# ==============================================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies
COPY package*.json ./
RUN npm ci

# Copy application source code
COPY . .

# Pass build-time environment variable for Vite
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Build production bundle
RUN npm run build

# ==============================================================================
# Stage 2: Serve Static Assets with Nginx
# ==============================================================================
FROM nginx:alpine

# Remove default nginx html files
RUN rm -rf /usr/share/nginx/html/*

# Copy built static bundle from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration for Single Page App (SPA)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Support Cloud Run dynamic $PORT (defaults to 8080)
ENV PORT=8080
EXPOSE 8080

# Substitute $PORT into Nginx config on container startup
CMD ["/bin/sh", "-c", "sed -i \"s/listen 8080;/listen ${PORT};/g\" /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]
