import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import Web3Modal from 'web3modal';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);

  const connectWallet = async () => {
    try {
      const web3Modal = new Web3Modal({
        cacheProvider: true,
        providerOptions: {},
      });

      const connection = await web3Modal.connect();
      const provider = new ethers.providers.Web3Provider(connection);
      const signer = provider.getSigner();
      const address = await signer.getAddress();

      setProvider(provider);
      setSigner(signer);
      setAccount(address);

      // Listen for account changes
      connection.on("accountsChanged", (accounts) => {
        setAccount(accounts[0]);
      });

      // Listen for chain changes
      connection.on("chainChanged", () => {
        window.location.reload();
      });

      return { provider, signer, address };
    } catch (error) {
      console.error("Error connecting wallet:", error);
      throw error;
    }
  };

  const disconnectWallet = async () => {
    try {
      const web3Modal = new Web3Modal({
        cacheProvider: true,
        providerOptions: {},
      });
      await web3Modal.clearCachedProvider();
      setAccount(null);
      setRole(null);
      setProvider(null);
      setSigner(null);
    } catch (error) {
      console.error("Error disconnecting wallet:", error);
      throw error;
    }
  };

  const checkUserRole = async (contract, address) => {
    try {
      const user = await contract.users(address);
      if (user.isActive) {
        setRole(user.role);
      } else {
        setRole(null);
      }
    } catch (error) {
      console.error("Error checking user role:", error);
      setRole(null);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        const web3Modal = new Web3Modal({
          cacheProvider: true,
          providerOptions: {},
        });

        if (web3Modal.cachedProvider) {
          await connectWallet();
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
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
    connectWallet,
    disconnectWallet,
    checkUserRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}; 