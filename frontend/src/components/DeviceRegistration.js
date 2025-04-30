import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const DeviceRegistration = () => {
  const { ewasteTracker } = useAuth();
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
    <div style={{ maxWidth: '32rem', margin: '0 auto', padding: '1.5rem' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Register New Device</h2>
      
      {error && (
        <div style={{ 
          backgroundColor: '#fee2e2', 
          border: '1px solid #f87171', 
          color: '#b91c1c', 
          padding: '0.75rem', 
          borderRadius: '0.25rem', 
          marginBottom: '1rem' 
        }}>
          {error}
        </div>
      )}
      
      {success && (
        <div style={{ 
          backgroundColor: '#dcfce7', 
          border: '1px solid #4ade80', 
          color: '#166534', 
          padding: '0.75rem', 
          borderRadius: '0.25rem', 
          marginBottom: '1rem' 
        }}>
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.25rem' }}>
            Serial Number
          </label>
          <input
            type="text"
            name="serialNumber"
            value={formData.serialNumber}
            onChange={handleChange}
            required
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.375rem',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.25rem' }}>
            Device Type
          </label>
          <input
            type="text"
            name="deviceType"
            value={formData.deviceType}
            onChange={handleChange}
            required
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.375rem',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.25rem' }}>
            Hazard Level
          </label>
          <select
            name="hazardLevel"
            value={formData.hazardLevel}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.375rem',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
            }}
          >
            <option value="0">Low</option>
            <option value="1">Medium</option>
            <option value="2">High</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.25rem' }}>
            Operational Status
          </label>
          <select
            name="operationalStatus"
            value={formData.operationalStatus}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.375rem',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
            }}
          >
            <option value="0">Functional</option>
            <option value="1">Damaged</option>
            <option value="2">Hazardous</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '0.5rem 1rem',
            backgroundColor: loading ? '#93c5fd' : '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '0.375rem',
            fontSize: '0.875rem',
            fontWeight: '500',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.5 : 1
          }}
        >
          {loading ? 'Registering...' : 'Register Device'}
        </button>
      </form>
    </div>
  );
};

export default DeviceRegistration; 