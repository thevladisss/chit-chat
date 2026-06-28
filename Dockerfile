# ---- Stage 1: Build frontend ----
FROM node:22-alpine AS frontend-build

WORKDIR /app

RUN apk add --no-cache python3 make g++

# Copy workspace manifests so npm can resolve all workspaces
COPY package.json package-lock.json ./
COPY frontend/package.json ./frontend/
COPY backend/package.json ./backend/

RUN npm ci

COPY frontend/ ./frontend/

ARG VITE_API_URL
ARG VITE_WS_URL

RUN npm run build -w frontend

# ---- Stage 2: Build backend ----
FROM node:22-alpine AS backend-build

WORKDIR /app

RUN apk add --no-cache python3 make g++

COPY package.json package-lock.json ./
COPY frontend/package.json ./frontend/
COPY backend/package.json ./backend/

RUN npm ci

COPY backend/ ./backend/

RUN npm run build -w backend

# ---- Stage 3: Production ----
FROM node:22-alpine

WORKDIR /app

RUN apk add --no-cache python3 make g++

COPY package.json package-lock.json ./
COPY frontend/package.json ./frontend/
COPY backend/package.json ./backend/

RUN npm ci --omit=dev -w backend

COPY --from=backend-build /app/backend/dist ./dist
COPY --from=frontend-build /app/frontend/dist ./dist/public

EXPOSE 3000

CMD ["node", "dist/server.js"]
