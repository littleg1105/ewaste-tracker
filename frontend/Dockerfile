# Build stage
FROM node:18-alpine as build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies)
RUN npm install

# Copy source code
COPY . .

# Add wget for health check
RUN apk add --no-cache wget

# Wait for contract addresses to be available (will be created by volume mount)
COPY docker-wait-for-contracts.sh /scripts/
RUN chmod +x /scripts/docker-wait-for-contracts.sh
RUN mkdir -p /scripts

# Build the application (with contract integration)
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built assets from build stage
COPY --from=build /app/build /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"] 