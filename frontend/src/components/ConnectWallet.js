import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './ConnectWallet.css';

const ConnectWallet = () => {
  const { connectWallet, error } = useAuth();
  const navigate = useNavigate();

  const handleConnect = async () => {
    try {
      await connectWallet();
      navigate('/');
    } catch (err) {
      console.error('Error connecting wallet:', err);
    }
  };

  return (
    <div className="connect-wallet">
      <div className="connect-wallet-card">
        <h1 className="connect-wallet-title">Connect Your Wallet</h1>
        <p className="connect-wallet-description">
          Connect your wallet to access the E-Waste Tracker application.
        </p>
        {error && <div className="connect-wallet-error">{error}</div>}
        <button
          className="connect-wallet-button"
          onClick={handleConnect}
        >
          Connect Wallet
        </button>
      </div>
    </div>
  );
};

export default ConnectWallet; 