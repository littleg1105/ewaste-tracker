import React, { useState, useEffect } from 'react';
import { useContract } from '../context/ContractContext';
import { useAuth } from '../context/AuthContext';

const DeviceSearch = () => {
  const { ewasteTracker } = useContract();
  const { account } = useAuth();
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
    loadDevices();
  }, [ewasteTracker]);

  const loadDevices = async () => {
    try {
      setLoading(true);
      const deviceCount = await ewasteTracker.deviceCount();
      const devicePromises = [];

      for (let i = 1; i <= deviceCount; i++) {
        devicePromises.push(ewasteTracker.getDeviceById(i));
      }

      const deviceResults = await Promise.all(devicePromises);
      setDevices(deviceResults);
    } catch (err) {
      setError('Error loading devices');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadDeviceHistory = async (deviceId) => {
    try {
      const history = await ewasteTracker.getDeviceHistory(deviceId);
      setDeviceHistory(history);
    } catch (err) {
      console.error('Error loading device history:', err);
    }
  };

  const handleDeviceClick = async (device) => {
    setSelectedDevice(device);
    await loadDeviceHistory(device.id);
  };

  const filteredDevices = devices.filter(device => {
    const searchLower = searchTerm.toLowerCase();
    return (
      device.serialNumber.toLowerCase().includes(searchLower) ||
      device.deviceType.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return <div className="text-center p-4">Loading devices...</div>;
  }

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by serial number or device type..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white shadow rounded-lg p-4">
          <h2 className="text-xl font-bold mb-4">Devices</h2>
          <div className="space-y-2">
            {filteredDevices.map((device) => (
              <div
                key={device.id}
                onClick={() => handleDeviceClick(device)}
                className={`p-3 border rounded cursor-pointer hover:bg-gray-50 ${
                  selectedDevice?.id === device.id ? 'bg-blue-50' : ''
                }`}
              >
                <div className="font-semibold">{device.serialNumber}</div>
                <div className="text-sm text-gray-600">{device.deviceType}</div>
                <div className="text-sm">
                  Status: {DeviceStatus[device.status]}
                </div>
              </div>
            ))}
          </div>
        </div>

        {selectedDevice && (
          <div className="bg-white shadow rounded-lg p-4">
            <h2 className="text-xl font-bold mb-4">Device Details</h2>
            <div className="space-y-2">
              <div>
                <span className="font-semibold">Serial Number:</span>{' '}
                {selectedDevice.serialNumber}
              </div>
              <div>
                <span className="font-semibold">Device Type:</span>{' '}
                {selectedDevice.deviceType}
              </div>
              <div>
                <span className="font-semibold">Hazard Level:</span>{' '}
                {HazardLevel[selectedDevice.hazardLevel]}
              </div>
              <div>
                <span className="font-semibold">Operational Status:</span>{' '}
                {OperationalStatus[selectedDevice.operationalStatus]}
              </div>
              <div>
                <span className="font-semibold">Current Status:</span>{' '}
                {DeviceStatus[selectedDevice.status]}
              </div>
              <div>
                <span className="font-semibold">Owner:</span>{' '}
                {selectedDevice.deviceOwner}
              </div>
              <div>
                <span className="font-semibold">Current Holder:</span>{' '}
                {selectedDevice.currentHolder}
              </div>
            </div>

            <h3 className="text-lg font-semibold mt-4 mb-2">Device History</h3>
            <div className="space-y-2">
              {deviceHistory.map((history, index) => (
                <div key={index} className="border-b pb-2">
                  <div className="font-semibold">
                    {DeviceStatus[history.status]}
                  </div>
                  <div className="text-sm text-gray-600">
                    {new Date(history.timestamp * 1000).toLocaleString()}
                  </div>
                  <div className="text-sm">{history.notes}</div>
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