# E-Waste Tracking System - User Manual

This document provides instructions for using the E-Waste Tracking System, a blockchain-based platform for monitoring electronic waste from registration to final processing.

## Table of Contents

1. [System Overview](#system-overview)
2. [Getting Started](#getting-started)
3. [User Roles](#user-roles)
4. [Role-Specific Instructions](#role-specific-instructions)
   - [Administrator](#administrator)
   - [User](#user)
   - [Green Point](#green-point)
   - [Transporter](#transporter)
   - [Recycling Unit](#recycling-unit)
   - [Environment Inspector](#environment-inspector)
5. [Device Lifecycle](#device-lifecycle)
6. [Certificates](#certificates)
7. [Troubleshooting](#troubleshooting)

## System Overview

The E-Waste Tracking System is designed to provide transparent, immutable tracking of electronic waste using blockchain technology. Each device is tracked through its entire lifecycle from initial registration to final recycling or destruction, with digital certificates issued to verify proper disposal.

## Getting Started

### System Requirements

- A modern web browser (Chrome, Firefox, Safari, or Edge)
- MetaMask or another Ethereum wallet extension
- Access to the Ethereum network (can be a local development network, testnet, or mainnet)

### Connecting Your Wallet

1. Navigate to the application URL
2. Click "Connect Wallet" in the top-right corner
3. Select your wallet provider (MetaMask recommended)
4. Approve the connection request in your wallet
5. Your wallet address will appear in the navigation bar once connected

## User Roles

The system supports six distinct user roles, each with specific permissions:

1. **Administrator**: Manages user accounts and system configuration
2. **User**: Registers electronic devices for disposal
3. **Green Point**: Collects registered devices from users
4. **Transporter**: Transfers devices from Green Points to Recycling Units
5. **Recycling Unit**: Processes (recycles or destroys) devices and issues certificates
6. **Environment Inspector**: Monitors the entire system for compliance and transparency

## Role-Specific Instructions

### Administrator

#### Adding Users
1. Navigate to the Admin Panel
2. Fill out the "Add New User" form:
   - Enter the Ethereum address of the user
   - Provide a name
   - Select the appropriate role
3. Click "Add User"

#### Managing Existing Users
1. View all users in the "Current Users" section
2. Use the provided controls to update roles or deactivate users as needed

### User

#### Registering a Device
1. Navigate to "Register Device"
2. Fill out the device information:
   - Serial Number: A unique identifier for the device
   - Device Type: What kind of device it is (laptop, mobile phone, etc.)
   - Hazard Level: The environmental risk level of the device
   - Operational Status: The current working condition
3. Click "Register Device"
4. The device will now be visible to Green Points for collection

#### Viewing Registered Devices
1. Navigate to "Devices"
2. Use the search function to find your devices
3. View the current status and history of each device

### Green Point

#### Collecting Devices
1. Navigate to the Green Point Dashboard
2. View the "Devices Available for Collection" list
3. Select a device to see its details
4. Click "Collect This Device"
5. Add collection notes and confirm

#### Managing Collected Devices
1. View all devices you've collected in the dashboard
2. Monitor which devices have been picked up by Transporters

### Transporter

#### Starting Transport
1. Navigate to the Transporter Dashboard
2. In the "Start Transport" section, select a device that has been collected
3. Enter transport route details
4. Click "Start Transport"

#### Delivering Devices
1. In the "Deliver Device" section, select a device that is in transit
2. Enter the Ethereum address of the receiving Recycling Unit
3. Click "Deliver Device"

### Recycling Unit

#### Processing Devices
1. Navigate to the Recycling Unit Dashboard
2. Select a device from the "Delivered Devices" list
3. Choose the processing type:
   - Recycle: For devices that can be recycled
   - Destroy: For devices that must be destroyed
4. Enter detailed processing information
5. Click "Process Device"

#### Issuing Certificates
1. Select a processed device from the list
2. Enter the processing method details
3. Click "Issue Certificate"
4. The certificate will be stored on the blockchain as permanent proof of proper disposal

### Environment Inspector

#### Monitoring the System
1. Navigate to the Inspector Dashboard
2. View the overall system statistics in the "Overview" section
3. Use the "Device Search" to find specific devices

#### Verifying Certificates
1. Search for a specific device
2. If a certificate is available, click "View Certificate"
3. Click "Verify Certificate Authenticity" to check the blockchain record
4. The system will indicate whether the certificate is valid

## Device Lifecycle

Each device in the system follows a defined lifecycle:

1. **Registration**: The device is registered by a User
2. **Collection**: The device is collected by a Green Point
3. **Transport**: The device is transported by a Transporter
4. **Delivery**: The device is delivered to a Recycling Unit
5. **Processing**: The device is either recycled or destroyed
6. **Certification**: A certificate is issued confirming proper disposal

## Certificates

### Certificate Verification

Certificates stored on the blockchain contain the following information:
- Device ID
- Recycling Unit address
- Issue date
- Processing method
- Digital signature

To verify a certificate:
1. Navigate to the Certificates section
2. Enter the certificate ID or device ID
3. Click "Verify Certificate"
4. The system will check the blockchain for validity

## Troubleshooting

### Common Issues

#### Wallet Connection Problems
- Make sure your wallet (MetaMask) is unlocked
- Verify you are connected to the correct network
- Try refreshing the page and reconnecting

#### Transaction Failures
- Check that you have enough ETH for transaction fees
- Verify you have the correct permissions for the action
- Increase the gas limit if necessary

#### Missing Devices or Certificates
- Verify you are logged in with the correct account
- Check that the device ID is entered correctly
- Make sure the device has reached the appropriate stage in the lifecycle

### Support

For additional assistance, please contact the system administrator or refer to the technical documentation. 