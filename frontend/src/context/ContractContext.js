import React, { createContext, useContext, useState, useEffect } from 'react';
import { Contract } from 'ethers';
import EWasteTracker from '../artifacts/contracts/EWasteTracker.sol/EWasteTracker.json';
import EWasteCertificate from '../artifacts/contracts/EWasteCertificate.sol/EWasteCertificate.json';
import contractAddresses from '../contractAddresses.json';
import { useAuth } from './AuthContext';

const ContractContext = createContext();

export const useContract = () => useContext(ContractContext);

export const ContractProvider = ({ children }) => {
  const { provider, signer } = useAuth();
  const [ewasteTracker, setEwasteTracker] = useState(null);
  const [eWasteCertificate, setEWasteCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initContracts = async () => {
      try {
        setError(null);
        setLoading(true);

        if (!provider || !signer) {
          console.log('Provider or signer not available - waiting for wallet connection');
          setLoading(false);
          return;
        }

        if (!contractAddresses.EWasteTracker || !contractAddresses.EWasteCertificate) {
          throw new Error('Contract addresses not found in contractAddresses.json');
        }

        if (!EWasteTracker.abi || !EWasteCertificate.abi) {
          throw new Error('Contract ABIs not found in artifacts');
        }

        console.log('Initializing contracts with addresses:', {
          tracker: contractAddresses.EWasteTracker,
          certificate: contractAddresses.EWasteCertificate
        });

        // Create contract instances using the addresses from contractAddresses.json
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

        // Verify contract initialization
        try {
          // Check if the contract has the deviceCount method
          if (!trackerContract.deviceCount) {
            throw new Error('Contract does not have deviceCount method. Please verify the contract is deployed correctly.');
          }

          const deviceCount = await trackerContract.deviceCount();
          console.log('EWasteTracker contract initialized successfully. Device count:', deviceCount.toString());
        } catch (err) {
          console.error('Error verifying EWasteTracker contract:', err);
          if (err.code === 'BAD_DATA') {
            throw new Error('Contract ABI does not match deployed contract. Please verify contract addresses and ABIs.');
          }
          if (err.message.includes('deviceCount')) {
            throw new Error('Contract does not have deviceCount method. Please verify the contract is deployed correctly.');
          }
          throw new Error('Failed to initialize EWasteTracker contract. Please ensure the contract is deployed and accessible.');
        }

        setEwasteTracker(trackerContract);
        setEWasteCertificate(certificateContract);
      } catch (error) {
        console.error('Error initializing contracts:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    initContracts();
  }, [provider, signer]);

  const value = {
    ewasteTracker,
    eWasteCertificate,
    loading,
    error,
  };

  return (
    <ContractContext.Provider value={value}>
      {children}
    </ContractContext.Provider>
  );
}; 