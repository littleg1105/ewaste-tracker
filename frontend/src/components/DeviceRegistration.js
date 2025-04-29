import React, { useState } from 'react';
import { useContract } from '../context/ContractContext';
import { useAuth } from '../context/AuthContext';

const DeviceRegistration = () => {
  const { ewasteTracker } = useContract();
  const { signer } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    serialNumber: '',
    deviceType: '',
    hazardLevel: '0', // Low
    operationalStatus: '0', // Functional
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const tx = await ewasteTracker.connect(signer).registerDevice(
        formData.serialNumber,
        formData.deviceType,
        parseInt(formData.hazardLevel),
        parseInt(formData.operationalStatus)
      );

      await tx.wait();
      setSuccess('Device registered successfully!');
      setFormData({
        serialNumber: '',
        deviceType: '',
        hazardLevel: '0',
        operationalStatus: '0',
      });
    } catch (err) {
      setError(err.message || 'Error registering device');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Register New Device</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Serial Number
          </label>
          <input
            type="text"
            name="serialNumber"
            value={formData.serialNumber}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Device Type
          </label>
          <input
            type="text"
            name="deviceType"
            value={formData.deviceType}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Hazard Level
          </label>
          <select
            name="hazardLevel"
            value={formData.hazardLevel}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="0">Low</option>
            <option value="1">Medium</option>
            <option value="2">High</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Operational Status
          </label>
          <select
            name="operationalStatus"
            value={formData.operationalStatus}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="0">Functional</option>
            <option value="1">Damaged</option>
            <option value="2">Hazardous</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {loading ? 'Registering...' : 'Register Device'}
        </button>
      </form>
    </div>
  );
};

export default DeviceRegistration; 