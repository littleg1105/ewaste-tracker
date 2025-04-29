import React, { createContext, useContext, useState, useEffect } from 'react';
import { BrowserProvider, JsonRpcSigner } from 'ethers';
import Web3Modal from 'web3modal';

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
      
      const provider = new BrowserProvider(connection);
      console.log('Provider initialized, getting signer...');
      
      const signer = await provider.getSigner();
      console.log('Signer obtained, getting address...');
      
      const address = await signer.getAddress();
      console.log('Wallet connected successfully:', address);

      setProvider(provider);
      setSigner(signer);
      setAccount(address);

      // Listen for account changes
      connection.on("accountsChanged", (accounts) => {
        console.log('Account changed:', accounts[0]);
        setAccount(accounts[0]);
      });

      // Listen for chain changes
      connection.on("chainChanged", () => {
        console.log('Chain changed, reloading...');
        window.location.reload();
      });

      return { provider, signer, address };
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
      console.log('Wallet disconnected successfully');
    } catch (error) {
      console.error("Error disconnecting wallet:", error);
      setError(error.message);
      throw error;
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
        setRole(user.role);
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