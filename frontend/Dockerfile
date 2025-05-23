# Build phase
FROM node:18-alpine as build
WORKDIR /app
COPY package.json package-lock.json* ./
# package-lock.json might not exist on first build if user hasn't run npm install locally after create-react-app
# or if it's gitignored. Handle this gracefully.
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi
RUN npm install react-router-dom
COPY . .
RUN npm run build

# Production phase
FROM nginx:stable-alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"] 