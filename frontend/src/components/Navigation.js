import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navigation.css';

const Navigation = () => {
  const { account, role, disconnectWallet } = useAuth();
  const navigate = useNavigate();

  const handleDisconnect = async () => {
    await disconnectWallet();
    navigate('/');
  };

  const getMenuItems = () => {
    const items = [
      { path: '/', label: 'Home' },
      { path: '/devices', label: 'Devices' },
    ];

    if (role === 0) { // Admin
      items.push({ path: '/users', label: 'User Management' });
    }

    if (role === 1) { // User
      items.push({ path: '/register-device', label: 'Register Device' });
    }

    if (role === 2) { // Green Point
      items.push({ path: '/collect-device', label: 'Collect Device' });
    }

    if (role === 3) { // Transporter
      items.push({ path: '/transport-device', label: 'Transport Device' });
    }

    if (role === 4) { // Recycling Unit
      items.push(
        { path: '/process-device', label: 'Process Device' },
        { path: '/certificates', label: 'Certificates' }
      );
    }

    if (role === 5) { // Environment Inspector
      items.push({ path: '/inspection', label: 'Inspection' });
    }

    return items;
  };

  return (
    <nav className="navigation">
      <div className="navigation-container">
        <div className="navigation-links">
          {getMenuItems().map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="nav-link"
            >
              {item.label}
            </Link>
          ))}
        </div>
        <div className="navigation-actions">
          {account ? (
            <>
              <span className="account-address">
                {account.slice(0, 6)}...{account.slice(-4)}
              </span>
              <button
                onClick={handleDisconnect}
                className="disconnect-button"
              >
                Disconnect
              </button>
            </>
          ) : (
            <Link
              to="/connect"
              className="connect-button"
            >
              Connect Wallet
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation; 