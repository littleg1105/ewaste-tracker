import React, { createContext, useContext, useState, useEffect } from 'react';
import { BrowserProvider, Contract } from 'ethers';
import Web3Modal from 'web3modal';
import EWasteTracker from '../artifacts/contracts/EWasteTracker.sol/EWasteTracker.json';
import EWasteCertificate from '../artifacts/contracts/EWasteCertificate.sol/EWasteCertificate.json';
import contractAddresses from '../contractAddresses.json';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [error, setError] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [ewasteTracker, setEwasteTracker] = useState(null);
  const [eWasteCertificate, setEWasteCertificate] = useState(null);

  const initContracts = async (signer) => {
    try {
      if (!signer) {
        console.log('Signer not available - waiting for wallet connection');
        return null;
      }

      if (!contractAddresses.EWasteTracker || !contractAddresses.EWasteCertificate) {
        throw new Error('Contract addresses not found in contractAddresses.json');
      }

      console.log('Initializing contracts with addresses:', {
        tracker: contractAddresses.EWasteTracker,
        certificate: contractAddresses.EWasteCertificate
      });

      // Create contract instances
      const trackerContract = new Contract(
        contractAddresses.EWasteTracker,
        EWasteTracker.abi,
        signer
      );

      const certificateContract = new Contract(
        contractAddresses.EWasteCertificate,
        EWasteCertificate.abi,
        signer
      );

      setEwasteTracker(trackerContract);
      setEWasteCertificate(certificateContract);

      return trackerContract;
    } catch (error) {
      console.error('Error initializing contracts:', error);
      setError(error.message);
      return null;
    }
  };

  const checkUserRole = async (contract, address) => {
    if (!contract || !address) {
      console.log('Contract or address not available for role check');
      return;
    }

    try {
      setError(null);
      console.log('Checking user role for address:', address);
      const user = await contract.users(address);
      
      if (user.isActive) {
        console.log('User role:', user.role);
        setRole(Number(user.role));
      } else {
        console.log('User not active');
        setRole(null);
      }
    } catch (error) {
      console.error("Error checking user role:", error);
      setError(error.message);
      setRole(null);
    }
  };

  const connectWallet = async () => {
    if (isConnecting) {
      console.log('Wallet connection already in progress');
      return;
    }

    try {
      setIsConnecting(true);
      setError(null);
      const web3Modal = new Web3Modal({
        cacheProvider: true,
        providerOptions: {},
      });

      console.log('Connecting to wallet...');
      const connection = await web3Modal.connect();
      console.log('Wallet connected, initializing provider...');
      
      const ethersProvider = new BrowserProvider(connection);
      console.log('Provider initialized, getting signer...');
      
      const ethersSigner = await ethersProvider.getSigner();
      console.log('Signer obtained, getting address...');
      
      const address = await ethersSigner.getAddress();
      console.log('Wallet connected successfully:', address);

      setProvider(ethersProvider);
      setSigner(ethersSigner);
      setAccount(address);

      // Initialize contracts
      const trackerContract = await initContracts(ethersSigner);
      if (trackerContract) {
        await checkUserRole(trackerContract, address);
      }

      // Listen for account changes
      connection.on("accountsChanged", async (accounts) => {
        console.log('Account changed:', accounts[0]);
        const newAddress = accounts[0];
        setAccount(newAddress);
        
        // Get new signer for the new account
        const newSigner = await ethersProvider.getSigner();
        setSigner(newSigner);
        
        // Reinitialize contracts with new signer
        const newTrackerContract = await initContracts(newSigner);
        if (newTrackerContract) {
          await checkUserRole(newTrackerContract, newAddress);
        }
      });

      // Listen for chain changes
      connection.on("chainChanged", () => {
        console.log('Chain changed, reloading...');
        window.location.reload();
      });

      return { provider: ethersProvider, signer: ethersSigner, address };
    } catch (error) {
      console.error("Error connecting wallet:", error);
      setError(error.message);
      throw error;
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = async () => {
    try {
      setError(null);
      const web3Modal = new Web3Modal({
        cacheProvider: true,
        providerOptions: {},
      });
      await web3Modal.clearCachedProvider();
      setAccount(null);
      setRole(null);
      setProvider(null);
      setSigner(null);
      setEwasteTracker(null);
      setEWasteCertificate(null);
      console.log('Wallet disconnected successfully');
    } catch (error) {
      console.error("Error disconnecting wallet:", error);
      setError(error.message);
      throw error;
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        setError(null);
        const web3Modal = new Web3Modal({
          cacheProvider: true,
          providerOptions: {},
        });

        if (web3Modal.cachedProvider) {
          console.log('Found cached provider, attempting to connect...');
          await connectWallet();
        } else {
          console.log('No cached provider found');
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  const value = {
    account,
    role,
    loading,
    provider,
    signer,
    error,
    isConnecting,
    ewasteTracker,
    eWasteCertificate,
    connectWallet,
    disconnectWallet,
    checkUserRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 