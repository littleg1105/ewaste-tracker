FROM node:18-alpine

WORKDIR /app

# Install system dependencies
RUN apk add --no-cache python3 make g++ git bash wget dos2unix

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Install hardhat globally for CLI usage
RUN npm install -g hardhat

# Copy source code
COPY . .

# Verify Hardhat installation
RUN npx hardhat --version

# Make scripts directory and copy entrypoint script
RUN mkdir -p /docker-entrypoint.d
COPY docker-entrypoint.sh /docker-entrypoint.d/
RUN dos2unix /docker-entrypoint.d/docker-entrypoint.sh && \
    chmod +x /docker-entrypoint.d/docker-entrypoint.sh

# Expose ports
EXPOSE 8545

# Set entrypoint
ENTRYPOINT ["/docker-entrypoint.d/docker-entrypoint.sh"]

# Start the development environment by default
CMD ["npx", "hardhat", "node"] 