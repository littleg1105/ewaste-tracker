# E-Waste Tracker Docker Deployment Guide

This guide provides a quick reference for deploying the E-Waste Tracker application using Docker.

## Prerequisites

- Docker and Docker Compose
- Wget or cURL (for testing)

## Quick Start

The easiest way to start the entire application with Docker:

```bash
npm run docker:start
```

This single command:
1. Builds all containers
2. Deploys all contracts
3. Adds test data
4. Starts the frontend

## Available Commands

```bash
# Start the application (all-in-one)
npm run docker:start

# Clean up containers and start fresh
npm run docker:clean
npm run docker:start

# Or do it in one step
npm run docker:restart

# View logs for debugging
npm run docker:logs
```

## Manually Checking Deployment

After deployment, you can verify everything is working:

```bash
# Check if contract addresses are available
wget -q -O- http://localhost:80/contractAddresses.json

# Check hardhat node status
wget -q --spider http://localhost:8545
```

## Accessing the Application

- **Frontend**: http://localhost:80
- **Blockchain**: http://localhost:8545

## Architecture

The Docker setup consists of:

1. **Hardhat Container**: 
   - Handles smart contract deployment
   - Runs the local Ethereum node
   - Automatically adds test data

2. **Frontend Container**: 
   - Nginx-based web server
   - Serves the React application
   - Connects to contracts deployed by Hardhat container

## Troubleshooting

### Frontend Can't Connect to Contracts
If you see errors loading devices or permissions:

1. Clear your browser cache:
   - Open developer tools
   - Go to Application → Storage → Clear Site Data
   - Reload the page

2. Check contract addresses:
   ```bash
   wget -q -O- http://localhost:80/contractAddresses.json
   ```

3. Restart all containers:
   ```bash
   npm run docker:restart
   ```

### Container Health Issues
If containers fail health checks:

```bash
# View container logs for errors
npm run docker:logs

# Try a complete reset
npm run docker:clean
docker system prune -f
npm run docker:start
```

### Permission Issues
If admin access isn't working correctly:

1. Check that you're connecting with the first account (0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266)
2. Make sure your wallet is connected to the correct network (http://localhost:8545)
3. Try restarting the Docker containers 