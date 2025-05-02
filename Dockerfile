FROM node:18-alpine

WORKDIR /app

# Install system dependencies
RUN apk add --no-cache python3 make g++ git bash wget

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Make scripts directory
RUN mkdir -p /scripts

# Copy entrypoint script
COPY docker-entrypoint.sh /scripts/
RUN chmod +x /scripts/docker-entrypoint.sh

# Expose ports
EXPOSE 8545

# Set entrypoint
ENTRYPOINT ["/scripts/docker-entrypoint.sh"]

# Start the development environment by default
CMD ["npx", "hardhat", "node"] 