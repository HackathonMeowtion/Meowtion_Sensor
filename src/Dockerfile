# ---------- build stage ----------
    FROM node:20 AS build
    WORKDIR /app
    
    # Copy manifests first for better layer caching
    COPY package*.json ./
    RUN npm ci
    
    # Work around npm optional-deps + Rollup native pkg bug in containers
    RUN npm i -D @rollup/rollup-linux-x64-gnu@^4
    
    # Copy the rest of the project (remember: you're in src/)
    COPY . .
    
# (Hackathon OK; exposes key in built JS)
ARG VITE_GEMINI_API_KEY
ARG VITE_AUTH0_DOMAIN
ARG VITE_AUTH0_CLIENT_ID
ENV VITE_GEMINI_API_KEY=$VITE_GEMINI_API_KEY \
    VITE_AUTH0_DOMAIN=$VITE_AUTH0_DOMAIN \
    VITE_AUTH0_CLIENT_ID=$VITE_AUTH0_CLIENT_ID
    
    # Build Vite app -> /app/dist
    RUN npm run build
    
    # ---------- runtime stage ----------
    FROM nginx:alpine
    # SPA-friendly nginx config; listens on 8080 for Cloud Run
    COPY nginx.conf /etc/nginx/conf.d/default.conf
    COPY --from=build /app/dist /usr/share/nginx/html
    EXPOSE 8080
    CMD ["nginx", "-g", "daemon off;"]
    