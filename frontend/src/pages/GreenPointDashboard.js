import React, { useState, useEffect } from 'react';
import { useContract } from '../context/ContractContext';
import { useAuth } from '../context/AuthContext';

const GreenPointDashboard = () => {
  const { ewasteTracker } = useContract();
  const { signer, role } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deviceId, setDeviceId] = useState('');
  const [notes, setNotes] = useState('');
  const [registeredDevices, setRegisteredDevices] = useState([]);
  const [deviceDetails, setDeviceDetails] = useState(null);
  const [fetchingDetails, setFetchingDetails] = useState(false);

  // Status mapping for display
  const statusNames = ['Registered', 'Collected', 'In Transit', 'Delivered', 'Recycled', 'Destroyed'];
  const hazardLevelNames = ['Low', 'Medium', 'High'];
  const operationalStatusNames = ['Functional', 'Damaged', 'Hazardous'];

  useEffect(() => {
    // Load registered devices when component mounts
    loadRegisteredDevices();
  }, [ewasteTracker]);

  const loadRegisteredDevices = async () => {
    if (!ewasteTracker) return;

    try {
      setLoading(true);
      // Get devices with "Registered" status (0)
      const devices = await ewasteTracker.getDevicesByStatus(0);
      setRegisteredDevices(devices.map(id => id.toString()));
    } catch (err) {
      console.error('Error loading registered devices:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDeviceDetails = async (id) => {
    if (!ewasteTracker || !id) return;

    try {
      setFetchingDetails(true);
      const device = await ewasteTracker.getDeviceById(id);
      setDeviceDetails({
        id: device.id.toString(),
        serialNumber: device.serialNumber,
        deviceType: device.deviceType,
        hazardLevel: parseInt(device.hazardLevel),
        operationalStatus: parseInt(device.operationalStatus),
        status: parseInt(device.status),
        owner: device.deviceOwner,
        currentHolder: device.currentHolder,
        registrationDate: new Date(device.registrationDate * 1000).toLocaleString(),
        lastUpdateDate: new Date(device.lastUpdateDate * 1000).toLocaleString(),
      });
    } catch (err) {
      console.error('Error fetching device details:', err);
      setError('Failed to fetch device details');
    } finally {
      setFetchingDetails(false);
    }
  };

  const handleCollect = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (!deviceId) {
        throw new Error('Please enter a device ID');
      }

      const tx = await ewasteTracker.connect(signer).collectDevice(deviceId, notes);
      await tx.wait();
      
      setSuccess(`Device #${deviceId} collected successfully!`);
      setDeviceId('');
      setNotes('');
      
      // Refresh device list
      loadRegisteredDevices();
    } catch (err) {
      setError(err.message || 'Error collecting device');
    } finally {
      setLoading(false);
    }
  };

  // Check if user has Green Point role
  if (role !== 2) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-50 p-4 rounded border border-red-200">
          <p className="text-red-800">You do not have permission to access this page. Only Green Point operators can collect devices.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Green Point Dashboard</h1>
      
      {error && (
        <div className="bg-red-50 p-4 rounded border border-red-200 mb-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 p-4 rounded border border-green-200 mb-4">
          <p className="text-green-800">{success}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Form to collect a device */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Collect Device</h2>
          <form onSubmit={handleCollect} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Device ID
              </label>
              <input
                type="number"
                value={deviceId}
                onChange={(e) => setDeviceId(e.target.value)}
                required
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Enter device ID"
                min="1"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Collection Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Add collection details..."
                rows="3"
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className={`w-full p-2 text-white font-medium rounded-md ${
                loading ? 'bg-green-300 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {loading ? 'Processing...' : 'Collect Device'}
            </button>
          </form>
        </div>

        {/* Available devices for collection */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Devices Available for Collection</h2>
          
          {loading ? (
            <p className="text-gray-600">Loading devices...</p>
          ) : registeredDevices.length === 0 ? (
            <p className="text-gray-600">No devices available for collection.</p>
          ) : (
            <div className="space-y-4">
              <p className="text-gray-600">Select a device to view details:</p>
              <div className="max-h-60 overflow-y-auto">
                <ul className="divide-y divide-gray-200">
                  {registeredDevices.map((id) => (
                    <li 
                      key={id} 
                      className="py-2 cursor-pointer hover:bg-gray-50"
                      onClick={() => fetchDeviceDetails(id)}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Device #{id}</span>
                        <button 
                          className="text-blue-600 hover:text-blue-800 text-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeviceId(id);
                          }}
                        >
                          Select
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          
          {fetchingDetails && (
            <div className="mt-4">
              <p className="text-gray-600">Loading device details...</p>
            </div>
          )}
          
          {deviceDetails && !fetchingDetails && (
            <div className="mt-4 border-t pt-4">
              <h3 className="font-semibold text-lg mb-2">Device Details</h3>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Serial Number:</span> {deviceDetails.serialNumber}</p>
                <p><span className="font-medium">Type:</span> {deviceDetails.deviceType}</p>
                <p><span className="font-medium">Hazard Level:</span> {hazardLevelNames[deviceDetails.hazardLevel]}</p>
                <p><span className="font-medium">Condition:</span> {operationalStatusNames[deviceDetails.operationalStatus]}</p>
                <p><span className="font-medium">Status:</span> {statusNames[deviceDetails.status]}</p>
                <p><span className="font-medium">Registered:</span> {deviceDetails.registrationDate}</p>
                <p className="truncate"><span className="font-medium">Owner:</span> {deviceDetails.owner}</p>
              </div>
              <button
                onClick={() => setDeviceId(deviceDetails.id)}
                className="mt-3 w-full p-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Collect This Device
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GreenPointDashboard; 