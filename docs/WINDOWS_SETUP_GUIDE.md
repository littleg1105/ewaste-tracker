# E-Waste Tracker Setup Guide for Windows

This guide will walk you through setting up the E-Waste Tracker application on a Windows computer, assuming you have no development tools installed yet.

## Prerequisites Installation

### Step 1: Install Git

Git is a tool that helps download and manage code.

1. Go to [Git for Windows download page](https://git-scm.com/download/win)
2. Download the latest version (should start automatically)
3. Run the installer and use these settings:
   - Click "Next" until you reach "Adjusting your PATH environment"
   - Select "Git from the command line and also from 3rd-party software"
   - Keep clicking "Next" with default options
   - At the final screen, click "Install"
   - When finished, click "Finish"

### Step 2: Install Node.js

Node.js lets your computer run JavaScript code.

1. Go to [Node.js download page](https://nodejs.org/en/download/)
2. Click the Windows Installer button (.msi) for the LTS (Long Term Support) version
3. Run the downloaded installer
4. Accept the license agreement and click "Next"
5. Keep clicking "Next" with default options until you reach the installation screen
6. Click "Install"
7. When finished, click "Finish"

### Step 3: Install Docker Desktop

Docker lets you run the application in containers.

1. Go to [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop/)
2. Click "Download for Windows"
3. Run the installer
4. Follow the installer instructions (accept the terms and leave settings at default)
5. Click "Install"
6. After installation, restart your computer when prompted
7. After restarting, Docker Desktop should start automatically
   - You might see Windows Security Alert - make sure to check "Private networks" and click "Allow access"

### Step 4: Verify Installations

1. Press the Windows key, type "Command Prompt", and open it
2. Type these commands one at a time (press Enter after each):

```
git --version
```
You should see a version number like "git version 2.40.1.windows.1"

```
node --version
```
You should see a version number like "v18.17.1"

```
npm --version
```
You should see a version number like "9.6.7"

```
docker --version
```
You should see a version number like "Docker version 24.0.6, build ed223bc"

If any of these commands doesn't show a version number, that tool isn't installed correctly. Try reinstalling it.

## Getting and Running the E-Waste Tracker Application

### Step 1: Download the Application

1. Open Command Prompt (press Windows key, type "Command Prompt", and open it)
2. Create a folder for your project:

```
mkdir C:\EWasteTracker
cd C:\EWasteTracker
```

3. Download the project code:

```
git clone https://github.com/yourusername/ewaste-tracker.git .
```

(Replace "yourusername" with the actual GitHub username where the project is hosted)

### Step 2: Run the Application with Docker (Easiest Method)

1. Make sure Docker Desktop is running (check the Docker icon in your system tray)
2. In the Command Prompt window (make sure you're in the C:\EWasteTracker folder), run:

```
docker-compose up -d
```

3. Wait for Docker to download and set up everything (this may take a few minutes the first time)
4. Once it's done, open your web browser and go to:

```
http://localhost:80
```

You should now see the E-Waste Tracker application!

### Step 3: Connect MetaMask to the Application

To interact with the application, you need a wallet like MetaMask.

1. Install the MetaMask extension in your browser:
   - Go to [MetaMask](https://metamask.io/download/)
   - Click "Install MetaMask for Chrome" (or your browser)
   - Follow the instructions to add it to your browser

2. Set up MetaMask:
   - Click the MetaMask icon in your browser
   - Click "Get Started"
   - Create a new wallet and follow the setup instructions
   - Make sure to securely save your Secret Recovery Phrase

3. Connect MetaMask to the local blockchain:
   - Click the network dropdown at the top of MetaMask (usually says "Ethereum Mainnet")
   - Click "Add Network"
   - Click "Add a network manually"
   - Fill in these details:
     - Network Name: `E-Waste Local`
     - New RPC URL: `http://localhost:8545`
     - Chain ID: `1337`
     - Currency Symbol: `ETH`
   - Click "Save"

4. Import a test account:
   - In MetaMask, click your account icon in the top-right corner
   - Select "Import Account"
   - Paste this private key: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`
   - Click "Import"
   - This is the admin account with test Ether for transactions

5. Go back to the E-Waste Tracker website and click "Connect Wallet"
   - MetaMask will open
   - Select the imported account
   - Click "Connect"

You're now connected and can use the application with full admin access!

## Common Issues and Solutions

### "Docker isn't running" Error

If you see an error about Docker not running:
1. Check if Docker Desktop is running (look for the icon in your system tray)
2. If not, press the Windows key, search for "Docker Desktop", and open it
3. Wait for Docker to fully start
4. Try running your command again

### Website Shows "Connecting..." But Never Connects

If the website is loading but can't connect to the blockchain:
1. Make sure you're connected to the right network in MetaMask (E-Waste Local)
2. Check that Docker is running
3. Restart the application:
   - Open Command Prompt
   - Navigate to your project folder:
     ```
     cd C:\EWasteTracker
     ```
   - Stop and restart the application:
     ```
     docker-compose down
     docker-compose up -d
     ```
4. Refresh the website page

### "You don't have permission" Error

If you see permission errors in the application:
1. Make sure you're connected with the admin account in MetaMask
2. The admin account has this address: `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`
3. If you're using a different account, import the admin account using the private key mentioned earlier

## Stopping the Application

When you're done using the application:

1. Open Command Prompt
2. Navigate to your project folder:
   ```
   cd C:\EWasteTracker
   ```
3. Run:
   ```
   docker-compose down
   ```

This will shut down the application properly.

## Restarting the Application Later

To start the application again later:

1. Make sure Docker Desktop is running
2. Open Command Prompt
3. Navigate to your project folder:
   ```
   cd C:\EWasteTracker
   ```
4. Run:
   ```
   docker-compose up -d
   ```
5. Open your browser and go to `http://localhost:80` 