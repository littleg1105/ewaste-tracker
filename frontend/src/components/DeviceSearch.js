import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './DeviceSearch.css';

const DeviceSearch = () => {
  const { ewasteTracker, loading: authLoading } = useAuth();
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [deviceHistory, setDeviceHistory] = useState([]);

  const DeviceStatus = {
    0: 'Registered',
    1: 'Collected',
    2: 'In Transit',
    3: 'Delivered',
    4: 'Recycled',
    5: 'Destroyed'
  };

  const HazardLevel = {
    0: 'Low',
    1: 'Medium',
    2: 'High'
  };

  const OperationalStatus = {
    0: 'Functional',
    1: 'Damaged',
    2: 'Hazardous'
  };

  useEffect(() => {
    if (ewasteTracker && !authLoading) {
      loadDevices();
    }
  }, [ewasteTracker, authLoading]);

  const loadDevices = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('Loading devices...');
      
      if (!ewasteTracker) {
        throw new Error('Contract not initialized');
      }

      const deviceCount = await ewasteTracker.deviceCount();
      console.log('Device count:', deviceCount.toString());
      
      if (Number(deviceCount) === 0) {
        console.log('No devices found');
        setDevices([]);
        return;
      }

      const devicePromises = [];
      for (let i = 1; i <= Number(deviceCount); i++) {
        devicePromises.push(ewasteTracker.getDeviceById(i));
      }

      const deviceResults = await Promise.all(devicePromises);
      console.log('Raw device results:', deviceResults);
      
      // Convert BigInt values to strings or numbers and handle Proxy objects
      const processedDevices = deviceResults.map(device => {
        if (!device) {
          console.warn('Received null or undefined device');
          return null;
        }
        try {
          // Convert Proxy object to plain object
          const deviceObj = {
            id: Number(device.id),
            serialNumber: device.serialNumber,
            deviceType: device.deviceType,
            deviceOwner: device.deviceOwner,
            currentHolder: device.currentHolder,
            status: Number(device.status),
            hazardLevel: Number(device.hazardLevel),
            operationalStatus: Number(device.operationalStatus),
            registrationDate: Number(device.registrationDate),
            lastUpdateDate: Number(device.lastUpdateDate)
          };
          console.log('Processed device:', deviceObj);
          return deviceObj;
        } catch (err) {
          console.error('Error processing device:', err);
          return null;
        }
      }).filter(Boolean); // Remove null devices
      
      console.log('Processed devices:', processedDevices);
      setDevices(processedDevices);
    } catch (err) {
      console.error('Error loading devices:', err);
      setError('Error loading devices: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadDeviceHistory = async (deviceId) => {
    try {
      console.log('Loading history for device:', deviceId);
      const history = await ewasteTracker.getDeviceHistory(deviceId);
      console.log('Device history:', history);
      
      // Convert BigInt values to numbers
      const processedHistory = history.map(item => ({
        ...item,
        timestamp: Number(item.timestamp),
        status: Number(item.status)
      }));
      
      setDeviceHistory(processedHistory);
    } catch (err) {
      console.error('Error loading device history:', err);
      setError('Error loading device history: ' + err.message);
    }
  };

  const handleDeviceClick = async (device) => {
    setSelectedDevice(device);
    await loadDeviceHistory(device.id);
  };

  const filteredDevices = devices.filter(device => {
    if (!device || !device.serialNumber || !device.deviceType) {
      return false;
    }
    const searchLower = searchTerm.toLowerCase();
    return (
      device.serialNumber.toLowerCase().includes(searchLower) ||
      device.deviceType.toLowerCase().includes(searchLower)
    );
  });

  if (authLoading) {
    return <div className="loading">Initializing contracts...</div>;
  }

  if (!ewasteTracker) {
    return <div className="error">Contract not initialized. Please connect your wallet.</div>;
  }

  if (loading) {
    return <div className="loading">Loading devices...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="device-search">
      <input
        type="text"
        placeholder="Search by serial number or device type..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-input"
      />

      <div className="device-grid">
        <div className="device-list">
          <h2 className="device-list-title">Devices</h2>
          <div>
            {filteredDevices.length === 0 ? (
              <div className="no-devices">No devices found</div>
            ) : (
              filteredDevices.map((device) => (
                <div
                  key={device.id}
                  onClick={() => handleDeviceClick(device)}
                  className={`device-item ${selectedDevice?.id === device.id ? 'selected' : ''}`}
                >
                  <div className="device-serial">{device.serialNumber}</div>
                  <div className="device-type">{device.deviceType}</div>
                  <div className="device-status">
                    Status: {DeviceStatus[device.status]}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {selectedDevice && (
          <div className="device-details">
            <h2 className="device-details-title">Device Details</h2>
            <div className="device-info">
              <p><strong>Serial Number:</strong> {selectedDevice.serialNumber}</p>
              <p><strong>Type:</strong> {selectedDevice.deviceType}</p>
              <p><strong>Status:</strong> {DeviceStatus[selectedDevice.status]}</p>
              <p><strong>Hazard Level:</strong> {HazardLevel[selectedDevice.hazardLevel]}</p>
              <p><strong>Operational Status:</strong> {OperationalStatus[selectedDevice.operationalStatus]}</p>
              <p><strong>Owner:</strong> {selectedDevice.deviceOwner}</p>
              <p><strong>Current Holder:</strong> {selectedDevice.currentHolder}</p>
              <p><strong>Registration Date:</strong> {new Date(selectedDevice.registrationDate * 1000).toLocaleString()}</p>
              <p><strong>Last Update:</strong> {new Date(selectedDevice.lastUpdateDate * 1000).toLocaleString()}</p>
            </div>

            <h3 className="device-history-title">Device History</h3>
            <div className="device-history">
              {deviceHistory.map((item, index) => (
                <div key={index} className="history-item">
                  <p><strong>Status:</strong> {DeviceStatus[item.status]}</p>
                  <p><strong>Actor:</strong> {item.actor}</p>
                  <p><strong>Notes:</strong> {item.notes}</p>
                  <p><strong>Time:</strong> {new Date(item.timestamp * 1000).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeviceSearch; 