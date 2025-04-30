import React from 'react';
import { useAuth } from '../context/AuthContext';
import DeviceSearch from '../components/DeviceSearch';

const Home = () => {
  const { account } = useAuth();

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">E-Waste Tracker Dashboard</h1>
      {account ? (
        <DeviceSearch />
      ) : (
        <div className="bg-blue-50 p-4 rounded border border-blue-200 my-4">
          <p className="text-blue-800">Please connect your wallet to access the E-Waste Tracking System.</p>
        </div>
      )}
    </div>
  );
};

export default Home; 