# Stage 1: Build React app
FROM node:20 AS build

WORKDIR /app

# Copy only package files first for caching
COPY package*.json ./

ENV REACT_APP_API_URL=http://localhost:8000
#ENV REACT_APP_API_URL=https://backend-weathered-field-5170.fly.dev

# Install dependencies (Axios will be included)
RUN npm install

# Copy rest of the source code
COPY . .

# Build React app
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]