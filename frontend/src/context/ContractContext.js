import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import EWasteTracker from '../artifacts/contracts/EWasteTracker.sol/EWasteTracker.json';
import EWasteCertificate from '../artifacts/contracts/EWasteCertificate.sol/EWasteCertificate.json';
import { useAuth } from './AuthContext';

const ContractContext = createContext();

export const useContract = () => useContext(ContractContext);

export const ContractProvider = ({ children }) => {
  const { provider, signer } = useAuth();
  const [ewasteTracker, setEwasteTracker] = useState(null);
  const [ewasteCertificate, setEwasteCertificate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initContracts = async () => {
      if (provider && signer) {
        try {
          // Get the network
          const network = await provider.getNetwork();
          
          // Get the contract addresses from the artifacts
          const trackerAddress = EWasteTracker.networks[network.chainId]?.address;
          const certificateAddress = EWasteCertificate.networks[network.chainId]?.address;

          if (!trackerAddress || !certificateAddress) {
            throw new Error('Contract addresses not found for this network');
          }

          // Create contract instances
          const trackerContract = new ethers.Contract(
            trackerAddress,
            EWasteTracker.abi,
            signer
          );

          const certificateContract = new ethers.Contract(
            certificateAddress,
            EWasteCertificate.abi,
            signer
          );

          setEwasteTracker(trackerContract);
          setEwasteCertificate(certificateContract);
        } catch (error) {
          console.error('Error initializing contracts:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    initContracts();
  }, [provider, signer]);

  const value = {
    ewasteTracker,
    ewasteCertificate,
    loading,
  };

  return (
    <ContractContext.Provider value={value}>
      {!loading && children}
    </ContractContext.Provider>
  );
}; 